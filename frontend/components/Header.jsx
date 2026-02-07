import React from 'react';
import HeaderClient from './HeaderClient';
import {checkUser} from '@/lib/checkUser';

const Header = async () => {
  const user = await checkUser();
  return <HeaderClient user={user} />;
};

export default Header;
