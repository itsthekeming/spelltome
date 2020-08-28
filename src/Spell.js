import { Body, Card, CardItem, Container, H1, Text, View } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import LoadingScreen from './LoadingScreen';

export default function Spell({ route }) {
  const [spell, setSpell] = useState();

  useEffect(() => {
    const fetchSpell = async () => {
      const spellResponse = await fetch(
        `https://www.dnd5eapi.co/api/spells/${route.params.index}`
      );
      const spell = await spellResponse.json();
      setSpell(spell);
    };

    fetchSpell();
  }, []);

  const parseLevel = () => {
    return spell.level === 0 ? 'Cantrip' : spell.level;
  };

  const parseComponents = () => {
    let result = spell.components.join(', ');

    if (spell.components.includes('M')) {
      result += '*';
    }

    return result;
  };

  const parseRangeArea = () => {
    return spell.area_of_effect
      ? `${spell.range} (${spell.area_of_effect.size}ft ${spell.area_of_effect.type})`
      : spell.range;
  };

  const parseAttackSave = () => {
    if (spell.attack_type) {
      return spell.attack_type;
    } else if (spell.dc) {
      return spell.dc.dc_type.name + ' Save';
    } else {
      return 'None';
    }
  };

  const parseDamageType = () => {
    return spell.damage ? spell.damage.damage_type.name : 'N/A';
  };

  const parseDuration = () => {
    return spell.concentration
      ? `${spell.duration} (Concentration)`
      : spell.duration;
  };

  const Description = () => {
    let descriptionArray = [];
    let keyIterator = 0; //most dependable way to avoid duplicate key issues

    for (let i = 0; i < spell.desc.length; i++) {
      //if the current element is a header, skip the iteration
      //It'll be picked up in the next iteration and prepended
      if (isDescriptionHeader(spell.desc[i])) {
        continue;
      }

      let tag;

      if (i > 0 && isDescriptionHeader(spell.desc[i - 1])) {
        //if the previous element was a header, prepend it to the current element
        //if the header doesn't doesn't have a period, append one.
        const header = spell.desc[i - 1].endsWith('.')
          ? spell.desc[i - 1]
          : spell.desc[i - 1] + '.';
        tag = (
          <CardItem key={keyIterator}>
            <Body>
              <Text>
                <Text style={{ fontWeight: 'bold' }}>{header} </Text>
                {spell.desc[i]}
              </Text>
            </Body>
          </CardItem>
        );
      } else {
        tag = (
          <CardItem key={keyIterator}>
            <Body>
              <Text>{spell.desc[i]}</Text>
            </Body>
          </CardItem>
        );
      }

      descriptionArray.push(tag);
      keyIterator += 10;
    }

    //finally append the higher level info if there is any
    if (spell.higher_level) {
      descriptionArray.push(
        <CardItem key={keyIterator}>
          <Body>
            <Text>
              <Text style={{ fontWeight: 'bold' }}>At Higher Levels. </Text>
              {spell.higher_level}
            </Text>
          </Body>
        </CardItem>
      );
    }

    return descriptionArray;
  };

  const isDescriptionHeader = (value) => {
    /*
      The description comes in from the API as an array of strings.
      We can make a reasonable guess as to whether or not an array entry is a heading by counting its characters.

      However, there are some values that will still fail this (not very robust) test,
      so we explicitly check for those.

      If I was designing the API I would make it clear what were headers and what weren't.
      although that might considered a "UI" requirement built into the backend.
    */

    if (value === '- buildings') {
      //see spell 'Commune With Nature'
      return false;
    }
    return value.length < 25;
  };

  const SpellMetadata = ({
    label,
    children,
    capitalizeContent: capitalizeText = false
  }) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{label}</Text>
      <Text style={capitalizeText ? { textTransform: 'capitalize' } : {}}>
        {children}
      </Text>
    </View>
  );
  if (spell) {
    return (
      <Container>
        <ScrollView scrollIndicatorInsets={{ right: 1 }}>
          <Card transparent>
            <CardItem header>
              <H1>{spell.name}</H1>
            </CardItem>
            <CardItem>
              <Body>
                <SpellMetadata label="Level">{parseLevel()}</SpellMetadata>
                <SpellMetadata label="Range/Area">
                  {parseRangeArea()}
                </SpellMetadata>
                <SpellMetadata label="Duration">
                  {parseDuration()}
                </SpellMetadata>
                <SpellMetadata label="Attack/Save">
                  {parseAttackSave()}
                </SpellMetadata>
              </Body>
              <Body>
                <SpellMetadata label="Casting Time">
                  {spell.casting_time}
                </SpellMetadata>
                <SpellMetadata label="Components">
                  {parseComponents()}
                </SpellMetadata>
                <SpellMetadata label="School">
                  {spell.school.name}
                </SpellMetadata>
                <SpellMetadata label="Damage Type">
                  {parseDamageType()}
                </SpellMetadata>
              </Body>
            </CardItem>
          </Card>
          <Card transparent>
            <Description />
          </Card>
          {spell.material && (
            <Card transparent>
              <CardItem>
                <Text note>* {spell.material}</Text>
              </CardItem>
            </Card>
          )}
        </ScrollView>
      </Container>
    );
  } else {
    return <LoadingScreen />;
  }
}
