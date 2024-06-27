// src/App.js

import React, { useState, useEffect } from 'react';
import api from './services/api'; 
import Notification from './components/Notification';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState(null);

  useEffect(() => {
    api
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleNameChange = event => {
    setNewName(event.target.value);
  };

  const handleNumberChange = event => {
    setNewNumber(event.target.value);
  };

  const addPerson = event => {
    event.preventDefault();

    const existingPerson = persons.find(
      person => person.name.toLowerCase() === newName.toLowerCase()
    );

    if (existingPerson) {
      if (window.confirm(`${existingPerson.name} is already added to the phonebook. Replace the old number with a new one?`)) {
        const updatedPerson = { ...existingPerson, number: newNumber };

        updatePerson(updatedPerson);
      }
    } else {
      const newPerson = {
        name: newName,
        number: newNumber,
      };

      createPerson(newPerson);
    }
  };

  const updatePerson = updatedPerson => {
    api
      .update(updatedPerson.id, updatedPerson)
      .then(returnedPerson => {
        setPersons(persons.map(person =>
          person.id !== updatedPerson.id ? person : returnedPerson
        ));
        setNewName('');
        setNewNumber('');
        showNotification(`Updated ${returnedPerson.name}`, 'success');
      })
      .catch(error => {
        console.error('Error updating person:', error);
        showNotification(`Error updating ${updatedPerson.name}`, 'error');
      });
  };

  const createPerson = newPerson => {
    api
      .create(newPerson)
      .then(returnedPerson => {
        setPersons([...persons, returnedPerson]);
        setNewName('');
        setNewNumber('');
        showNotification(`Added ${returnedPerson.name}`, 'success');
      })
      .catch(error => {
        console.error('Error adding person:', error);
        showNotification(`Error adding ${newPerson.name}`, 'error');
      });
  };

  const showNotification = (message, type) => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotification(null);
      setNotificationType(null);
    }, 3000); // Ocultar la notificación después de 3 segundos
  };

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = id => {
    const personToDelete = persons.find(person => person.id === id);

    if (window.confirm(`Delete ${personToDelete.name}?`)) {
      api
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
          showNotification(`Deleted ${personToDelete.name}`, 'success');
        })
        .catch(error => {
          console.error('Error deleting person:', error);
          showNotification(`Error deleting ${personToDelete.name}`, 'error');
        });
    }
  };

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} type={notificationType} />
      <div>
        filter shown with: <input value={searchTerm} onChange={handleSearchChange} />
      </div>
      <h3>Add a new</h3>
      <form onSubmit={addPerson}>
        <div>
          <div>
            name: <input value={newName} onChange={handleNameChange} />
          </div>
          <div>
            number: <input value={newNumber} onChange={handleNumberChange} />
          </div>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      <h3>Numbers</h3>
      <ul>
        {filteredPersons.map(person => (
          <li key={person.id}>
            {person.name} {person.number}
            <button onClick={() => handleDelete(person.id)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
