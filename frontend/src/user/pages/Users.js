import React, { useEffect, useState } from 'react';
import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';


const Users = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [loadedUsers, setLoadedUsers] = useState([]); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(`${process.env.REACT_APP_ASSET_URL}/api/users`); // OBAVEZNO proati sa nepravilnom putanjom -> '${process.env.REACT_APP_ASSET_URL}/api/user'

        setLoadedUsers(responseData.users);
        
      } catch (err) {
        console.log(err)
      }
    };
    fetchUsers();
  }, [sendRequest]);// zbog ovoga sendRequest mora da bude unutar useCallback/a


  return (
    <React.Fragment>

      <h1 className="center">Milos Velickovic's App</h1>


      {/* Error modal se prikazuje samo kada ima greske */}
      <ErrorModal error={error} onClear={clearError} />
      {/* Loading spinner se prikazuje samo kada se ocitava komponenta */}
      {isLoading && (<div className="center"> <LoadingSpinner /> </div>)}

      {<UsersList items={loadedUsers} />}


    </React.Fragment>
  );
};

export default Users;
