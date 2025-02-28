import { useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';

import Button from '../components/Buttons/Button';
import { isNotAuthenticated } from '../lib/useToken';

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    isNotAuthenticated(navigate);
  }, []);

  return (
    <div className="items-center flex-col flex bg-[#131313] p-5 rounded-lg">
      <div className="grid gap-2 w-full">
        <Button>
          <Link to="/auth/login">Login</Link>
        </Button>
      </div>
    </div>
  );
};

export default App;
