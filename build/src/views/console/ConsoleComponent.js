import React from 'react';
import Iframe from 'react-iframe';

function ConsoleComponent() {
  const cli_url = window.__RUNTIME_CONFIG__.REACT_APP_CONSOLE_URI;

  return (
    <>
      <Iframe
        url={cli_url}
        width='100%'
        styles={{ border: 'none', height: '90vh' }}
        sandbox={['allow-forms', 'allow-scripts', 'allow-same-origin']}
        allow='clipboard-read; clipboard-write'
      />
    </>
  );
}

export default ConsoleComponent;
