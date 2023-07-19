import React, { useEffect, useState } from "react";
import {BrowserRouter} from 'react-router-dom';
import keycloak from './keycloak';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { ConfigProvider, theme} from 'antd';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import 'leaflet/dist/leaflet.css'

import MyRoutes from './routes/MyRoutes';
import { Provider } from 'react-redux';
import store from './store';

function App() {

  const asciiArt = `
  ª▓▓
╓æ
╔▓▓▓       ,æ▓▓w
g▓▓▓      ╥▓▓╣╣╢╢▓
,▓▓▀     ╔▓╣╣╣╢╢▓╩\`
╓▓▓    ╓▓╣╣╣╣╣▓▀         ,╔▓▓@
▓"   ╓▓╣╣╣╣╣▓\`         ╦▓╢╢╢╢╢▓
▓▓█  ▓╣╣╣╣╣▓           ╫╢╢╢╢╢▓╩
▓▓▓µ▓╣╣╣╣▓█▓█▄    ╓▓▓▓╗ ╨▓▓╝
█▓█╢╣╣╣╢▓▓▓▓▓▓▌╓▓╢╢╢╢╢╢
▐▓▌╣╣╢╢██████▓╢╢╢╢╢╢▓╝
█▌╢╢╢█████▀╢╢╢╢╢╢▓\`   ██████████ ,▄████████▄     4▓@     ██████████ ██F      ██
▀╢╢╣████▒╢╢╢╢╢╝      ██▄▄▄▄▄▄▄  ██▌      ▐█▌  ,▓╣╜ ╔φ   ██▄▄▄▄▄▄▄  ██▌      ██
╙▓╢███▌╢╢╢╢▓        ██▀▀▀▀▀▀▀  ██▌      ▐█▌ Æ╣╣▄╖╖▓╢W╖ ██▀▀▀▀▀▀▀  ██▌      ██
╙╣███╢╢╢▓         ██████████ '▀████████▀  \`\`\`\`\`\`▓▓P\` ██████████ '▀████████▀
▀██▒╢▓
▀╙╩ªw.     U = .   . .. \` -<   \`      .∩ Ω   =''   = ^ .   =.~\`   ./
`;
  console.log(asciiArt);
  setChonkyDefaults({iconComponent:ChonkyIconFA});

  const keycloakProviderInitConfig = {
    onLoad: 'login-required',
    checkLoginIframe: false
  }
  
  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ReactKeycloakProvider authClient={keycloak} initOptions={keycloakProviderInitConfig}>
          <Provider store={store}>

      <ConfigProvider
            theme={{
                algorithm: darkAlgorithm,
                token: {
                    "colorPrimary": "#418cc0",
                    "fontSize": 15,
                    "borderRadius": 14
                }
            }}
        >
          <BrowserRouter>
            <MyRoutes/>
          </BrowserRouter>
      </ConfigProvider>
      </Provider>

    </ReactKeycloakProvider>
  );
}

export default App;
