import React from 'react';
import Iframe from 'react-iframe';

function WorkflowEditorComponent() {
  const workflow_editor_url = window.__RUNTIME_CONFIG__.REACT_APP_WORKFLOW_EDITOR_URI;
  return (
    <>
      <Iframe
        url={workflow_editor_url}
        width='100%'
        styles={{ border: 'none', height: '100vh' }}
        id=''
        className=''
        display='block'
        position='relative'
      />
    </>
  );
}

export default WorkflowEditorComponent;
