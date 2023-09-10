import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './PlaceItem.css';

const PlaceItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openMapHandler = () => setShowMap(true);

  const closeMapHandler = () => setShowMap(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    console.log('DELETING...');
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `${process.env.REACT_APP_ASSET_URL}/api/places/${props.id}`,
        'DELETE',
        null,
        { 
          Authorization: 'Bearer ' + auth.token
        }
      );
      props.onDelete(props.id); // ova funkcija ponovo pokrece PlacesList.js za datog usera. Moze se zakomentarisati i u bazi ce biti izbrisan place i bez ove funkcije, ali se na stranici to nece prikazati. 
    } catch (err) {

    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>

      {/* ovaj sledeci modal je za Button Delete */}

      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to proceed and delete this place? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>




      <li className="place-item">
        <Card className="place-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__image">


            {/* scr atribut ispod je povezan sa place-controllers.js */}
            <img

              // src={props.image}

              src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`}

              alt={props.title}
            />




          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>
              VIEW ON MAP
            </Button>

            {/* OBAVENO POGLEDATI RAZLIKU IZMEDJU ZAKOMENTARISANOG I NEZAKOMENTARISANOG*/}


            {/* {auth.isLoggedIn && ( */}
            {/* {auth.token && ( */}
            {auth.userId === props.creatorId && (
              < Button to={`/places/${props.id}`}> EDIT - UpdatePlace.js</Button>
            )}

            {/* {auth.isLoggedIn && ( */}
            {/* {auth.token && ( */}
            {auth.userId === props.creatorId && (
              <Button danger onClick={showDeleteWarningHandler}>
                DELETE
              </Button>
            )}
          </div>
        </Card>
      </li >
    </React.Fragment >
  );
};

export default PlaceItem;




