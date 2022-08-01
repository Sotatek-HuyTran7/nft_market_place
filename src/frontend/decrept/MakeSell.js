import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Row, Form, Button, Card } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useParams } from 'react-router'
import { getMetadata, isApprovedForAll } from '../HelperFunction'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const MakeSell = ({ marketplace, nft, account }) => {
  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(null)

  const [items, setItems] = useState([])

  let { id } = useParams()

  const loadNFT = async () => {
    let metadata = await getMetadata(nft, id)
    let items = []
    const sellItem = {
      image: metadata.image,
      tokenId: id,
      name: metadata.name,
      description: metadata.description,
    }
    console.log(sellItem)

    items.push(sellItem)

    setItems(items)
    setImage(metadata.image)
    setName(metadata.name)
    setDescription(metadata.description)
  }

  const listNFT = async () => {
    await isApprovedForAll(nft, account, marketplace)

    const listingPrice = ethers.utils.parseEther(price.toString())
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()
    // await marketplace.makeItem(nft, id, price)
  }
  useEffect(() => {
    loadNFT()
  }, [])
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
              {items.map((item, idx) => (
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>TokenId: {item.tokenId}</Card.Title>
                    <Card.Title>Name: {item.name}</Card.Title>
                    <Card.Text>Description: {item.description}</Card.Text>
                  </Card.Body>
                </Card>
              ))}
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <Button onClick={listNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MakeSell
