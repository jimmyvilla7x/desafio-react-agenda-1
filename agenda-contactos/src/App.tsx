import React from 'react';
import { UsersProvider } from './contexts/UsersContext';
import './App.css';
import UserList from './components/UserList/UserList';

function App() {
  return (
    <div className="App">
      <UsersProvider>
        <UserList />
      </UsersProvider>
    </div>
  );
}

export default App;
