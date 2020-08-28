import React from 'react';
import { Container, Spinner } from 'native-base';

export default function LoadingScreen() {
  return (
    <Container
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center'
      }}>
      <Spinner color="#0066ff" size="small" />
    </Container>
  );
}
