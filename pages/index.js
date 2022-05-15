import { Avatar, Text, Button, Divider, Spacer } from '@geist-ui/core';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, signInWithGoogle, logout } from "../utils/firebase";
import { Mail } from '@geist-ui/icons';
import { useEffect } from 'react';

import Dashboard from '../components/Dashboard';

export default function Home() {
  const [user, loading, error] = useAuthState(auth);

  return (
    <div>
      <div className='flx-h-sb'>
        <Text h1 type='success'>stake</Text>
        <div className='flx-h-sb'>
          {user && <Avatar src={user.photoURL} scale={1.5} />}
          {!user &&
            <Button
              onClick={signInWithGoogle}
              icon={<Mail />}
              auto
            >
              Sign In
            </Button>
          }
          {user && < Spacer />}
          {user && <Button onClick={logout} auto>Sign Out</Button>}
        </div>
      </div>
      <Divider style={{ marginTop: -10 }} />
      <section style={{ height: '80vh' }}>
        {
          auth.currentUser
            ? <Dashboard user={auth.currentUser} />
            : <div>
              <Text h1 style={{ fontSize: 200 }}>Welcome to Stake.</Text>
              <Text type='success'><span onClick={signInWithGoogle} style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Sign in</span> to get started.</Text>
            </div>
        }
      </section>
    </div>
  )
}
