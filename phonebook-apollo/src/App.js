import { useState, useEffect } from 'react'
import { useQuery, useLazyQuery, useMutation } from '@apollo/client'
import {
  ALL_PERSONS,
  CREATE_PERSON,
  EDIT_NUMBER,
  FIND_BY_NAME,
} from './queries/queries'

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null
  }
  return <div style={{ color: 'red' }}>{errorMessage}</div>
}

const PhoneForm = ({ setError }) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [changeNumber, result] = useMutation(EDIT_NUMBER)

  useEffect(() => {
    if (result.data && result.data.editNumber === null) {
      setError('person not found')
    }
  }, [result.data]) //eslint-disable-line
  const submit = e => {
    e.preventDefault()
    changeNumber({ variables: { name, phone } })
    setName('')
    setPhone('')
  }
  return (
    <div>
      <h2>change number</h2>

      <form onSubmit={submit}>
        <div>
          name{' '}
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          phone{' '}
          <input
            value={phone}
            onChange={({ target }) => setPhone(target.value)}
          />
        </div>
        <button type='submit'>change number</button>
      </form>
    </div>
  )
}

const PersonForm = ({ setError }) => {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')

  const [createPerson] = useMutation(CREATE_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }],
    onError: error => setError(error.graphQLErrors[0].message),
  })

  const createNew = e => {
    e.preventDefault()
    createPerson({ variables: { name, phone, street, city } })
    setPhone('')
    setName('')
    setStreet('')
    setCity('')
  }
  return (
    <div>
      <h2>Create new</h2>
      <form onSubmit={createNew}>
        <div>
          phone{' '}
          <input
            type='text'
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>
        <div>
          name{' '}
          <input
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          street{' '}
          <input
            type='text'
            value={street}
            onChange={e => setStreet(e.target.value)}
          />
        </div>
        <div>
          city{' '}
          <input
            type='text'
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </div>
        <input type='submit' value='add' />
      </form>
    </div>
  )
}

const Persons = ({ persons, clear }) => {
  const [getPerson, result] = useLazyQuery(FIND_BY_NAME)
  const [person, setPerson] = useState(null)

  const showPerson = name => {
    getPerson({ variables: { nameToSearch: name } })
  }

  useEffect(() => {
    if (result.data) {
      setPerson(result.data.findPerson)
    }
  }, [result])

  if (person) {
    return (
      <div>
        <div>
          {person.address.street} {person.address.city}
        </div>
        <div>{person.phone}</div>
        <button onClick={() => setPerson(null)}>Close</button>
      </div>
    )
  }
  return (
    <div>
      <h2>Persons</h2>
      {persons.map(p => {
        return (
          <div
            key={p.name}
            style={{
              border: '1px solid gray',
              margin: '10 0',
              padding: '10px',
            }}>
            {p.name} {p.phone}
            <button onClick={() => showPerson(p.name)}>show address</button>
          </div>
        )
      })}
    </div>
  )
}

const App = () => {
  const [error, setError] = useState(null)
  const result = useQuery(ALL_PERSONS)
  if (result.loading) return <div>loading....</div>

  const notify = message => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 10000)
  }
  return (
    <div>
      <Notify errorMessage={error} />

      <Persons persons={result.data.allPersons} />
      <PersonForm setError={notify} />
      <PhoneForm setError={notify} />
    </div>
  )
}

export default App
