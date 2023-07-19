import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined} from '@ant-design/icons';
import { Typography } from 'antd';
const { Title } = Typography;

export default function CustomUserAvatar(props) {
    //const username = useSelector(selectUsername);
      const username = props.username;

    return (
      <>
        {username && <div style={{display: 'flex', justifyContent: 'end', alignItems: 'center'}}>
          <Avatar icon={<UserOutlined />} />
          <Title style={{textTransform: 'capitalize', margin: '0.5rem'}} level={5}>{username}</Title>
        </div>}
      </>
    )
  }