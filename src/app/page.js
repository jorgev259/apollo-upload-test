'use client'
import Image from 'next/image'
import styles from './page.module.css'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import serialize from 'form-serialize'

const helloMutation = gql`
  mutation Hello($file: Upload!) {
    hello(file: $file)
  }
`

const helloQuery = gql`
  query Hello {
    hello
  }
`

export default function Home () {
  const [mutate] = useMutation(helloMutation)
  const [query] = useLazyQuery(helloQuery)

  function handleSubmitForm (e) {
    e.preventDefault()
    e.persist()

    const data = serialize(e.target, { hash: true })
    data.file = e.target.elements.file.files[0]

    mutate({ variables: data }).then(results => {
      console.log(results)
    }).catch(err => {
      console.log(err)
    })
  }

  function handleSubmitForm2 (e) {
    e.preventDefault()
    e.persist()

    query().then(results => {
      console.log(results)
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <main className={styles.main}>
      <form onSubmit={handleSubmitForm}>
        <input type='file' name='file' accept='image/*' />
        <input type='submit' />
      </form>
      <form onSubmit={handleSubmitForm2}>
        <input type='submit' />
      </form>
    </main>
  )
}
