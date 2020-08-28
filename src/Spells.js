import { useTheme } from '@react-navigation/native';
import Fuse from 'fuse.js';
import {
  Container,
  Header,
  Icon,
  Input,
  Item,
  Left,
  ListItem,
  Right,
  Text
} from 'native-base';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView } from 'react-native';
import LoadingScreen from './LoadingScreen';

export default function Spells({ navigation }) {
  const { colors } = useTheme();
  const [spells, setSpells] = useState([]);
  // const [filteredSpells, setFilteredSpells] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholder, setPlaceholder] = useState();
  const scrollViewRef = useRef();

  //pull down the spells list from the api and set up the screen
  useEffect(() => {
    const loadData = async () => {
      const spellsResponse = await fetch('https://www.dnd5eapi.co/api/spells');
      const spells = await spellsResponse.json();
      setSpells(spells.results);
      setPlaceholder(getRandomPlaceholder(spells.results));
    };

    loadData();
  }, []);

  // recompute the placeholder if the search term is getting short
  // just a fun little addition that makes it to where the placeholder
  // is different every time the user deletes the box.
  // it does it at 1 character because otherwise there is a small
  // stutter when the user deletes the last character.
  // if the user clears the box, there's no way to recalculate this without
  // a small stutter. But, it should still be different from before they started typing
  useEffect(() => {
    if (searchTerm.length === 1) {
      setPlaceholder(getRandomPlaceholder(spells));
    }
  }, [searchTerm]);

  //using useMemo as a perf optimization because it's a big array
  const filteredSpells = useMemo(() => {
    // we can't do anything if the spells haven't arrived from the api yet
    if (spells.length === 0) {
      return [];
    }

    //now search with the term trimmed
    const term = searchTerm.trim();
    if (term === '') {
      //the user has cleared the search. display all spells
      return spells;
    } else if (term.length === 1) {
      //no need to search if its just one letter; alphabetical results are better
      return spells.filter((spell) => spell.name.startsWith(term));
    } else {
      //use fuse to fuzzy search spells
      const options = {
        keys: ['name'],
        threshold: 0.2
      };

      const fuse = new Fuse(spells, options);
      const results = fuse.search(term);
      return results.map((result) => result.item);
    }
  }, [searchTerm, spells]);

  //scroll to the top of the list when the filters spells are changed
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToOffset(0, false);
    }
  }, [filteredSpells]);

  //retrieve a random placeholder from the spells list
  const getRandomPlaceholder = (spells) => {
    return spells[Math.floor(Math.random() * spells.length)].name;
  };

  if (filteredSpells && placeholder) {
    return (
      <Container>
        <Header searchBar rounded>
          <Item>
            <Icon name="ios-search" />
            <Input
              value={searchTerm}
              clearButtonMode="always"
              placeholder={placeholder}
              onChangeText={(e) => setSearchTerm(e)}
            />
          </Item>
        </Header>
        {filteredSpells.length > 0 ? (
          <Container>
            <KeyboardAvoidingView behavior="padding">
              <FlatList
                ref={scrollViewRef} //used to scroll to top on search
                initialNumToRender={30}
                maxToRenderPerBatch={filteredSpells.length} //no blank spaces
                keyboardDismissMode="on-drag" //dismiss the keyboard when they start scrolling results
                keyboardShouldPersistTaps="always" //click results even when the keyboard is still open
                style={{ backgroundColor: colors.card }}
                data={filteredSpells}
                keyExtractor={(spell) => spell.index}
                renderItem={(item) => (
                  <ListItem
                    onPress={() =>
                      navigation.navigate('Spell', {
                        index: item.item.index,
                        name: item.item.name
                      })
                    }>
                    <Left>
                      <Text style={{ color: colors.text }}>
                        {item.item.name}
                      </Text>
                    </Left>
                    <Right>
                      <Icon name="arrow-forward" />
                    </Right>
                  </ListItem>
                )}
              />
            </KeyboardAvoidingView>
          </Container>
        ) : (
          <Container
            style={{
              display: 'flex',
              marginTop: 100,
              alignSelf: 'center'
            }}>
            <Text>No Spells Found</Text>
          </Container>
        )}
      </Container>
    );
  } else {
    return <LoadingScreen />;
  }
}
