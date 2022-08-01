import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import React from 'react'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { isApprovedForAll, renderLoadingAndError } from '../HelperFunction'
import POPUP from './PopUp'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Create = ({ marketplace, nft, account }) => {
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [mintSuccess, setMintSuccess] = useState(false)
  const [open, setOpen] = useState(false)
  const closeModal = () => setOpen(false)
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        console.log(result)
        setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
      } catch (error) {
        setError(error)
        console.log('ipfs image upload error: ', error)
      }
    }
  }

  const createNFT = async () => {
    if (!image || !name || !description) return
    try {
      const result = await client.add(
        JSON.stringify({ image, name, description }),
      )
      mint(result)
    } catch (error) {
      setError(error)
      console.log('ipfs uri upload error: ', error)
    }
  }

  const mint = async (result) => {
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`
    console.log('URI', uri)
    try {
      let receipt = await (await nft.mint(uri)).wait()
      if (receipt.status === 1) {
        setOpen(true)
      }
    } catch (error) {
      setError(error)
      console.log('ipfs uri upload error: ', error)
    }
  }
  const renderPopup = () => {
    return (
      <div>
        <Popup open={open} closeOnDocumentClick onClose={closeModal}>
          <div className="modal">
            <a className="close" onClick={closeModal}>
              &times;
            </a>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae
            magni omnis delectus nemo, maxime molestiae dolorem numquam
            mollitia, voluptate ea, accusamus excepturi deleniti ratione
            sapiente! Laudantium, aperiam doloribus. Odit, aut.
          </div>
        </Popup>
      </div>
    )
  }
  useEffect(() => {
    console.log(open)
  }, [open])
  //return (POPUP())

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: '1000px' }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />

              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create NFT
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
      {renderPopup()}
    </div>
  )
}

 export default Create
