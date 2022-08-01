import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Row, Form, Col, Card, Button } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import {
  getMetadata,
  isApprovedForAll,
  renderLoadingAndError,
  getShortAddress,
} from '../HelperFunction'

export default function NFTDetail({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [nftItem, setNFTItem] = useState([])
  const [price, setPrice] = useState(null)
  const [receiver, setReceiver] = useState('')
  const [error, setError] = useState('')
  const { nftId } = useParams()

  const loadItem = async () => {
    let itemId
    let itemBlockchain
    let metadata
    let owner
    let item

    itemId = await marketplace.tokenIdToItemId(nftId)
    itemBlockchain = await marketplace.itemIdToItem(itemId)
    metadata = await getMetadata(nft, nftId)
    owner = await nft.ownerOf(nftId)

    if (itemBlockchain.onSale === false) {
      console.log(owner.toLowerCase())
      item = {
        tokenId: nftId,

        image: metadata.image,
        name: metadata.name,
        description: metadata.description,
        owner: owner.toLowerCase(),
        onSale: false,
      }
      console.log('typeof owner', typeof item.owner, item.owner)
    } else {
      console.log(itemBlockchain.onSale)

      item = {
        tokenId: nftId,

        image: metadata.image,
        name: metadata.name,
        description: metadata.description,

        itemId: itemBlockchain.itemId.toString(),
        price: ethers.utils.formatUnits(itemBlockchain.price, 'wei'),
        seller: itemBlockchain.seller.toLowerCase(),
        onSale: true,
      }
      console.log('typeof', typeof item.seller)
    }

    console.log('itemdsdsads', item)

    setLoading(false)
    setNFTItem(item)
  }
  const buyMarketItem = async () => {
    await (
      await marketplace.purchaseItem(nftItem.itemId, { value: nftItem.price })
    ).wait()
    loadItem()
  }
  const cancelItem = async () => {
    await isApprovedForAll(nft, account, marketplace)
    await (await marketplace.cancelItem(nftItem.itemId)).wait()
    loadItem()
  }
  const sellItem = async () => {
    await isApprovedForAll(nft, account, marketplace)

    const listingPrice = ethers.utils.parseEther(price.toString())
    await (
      await marketplace.makeItem(nft.address, nftItem.tokenId, listingPrice)
    ).wait()
    loadItem()
  }
  const giftNFT = async () => {
    await isApprovedForAll(nft, account, marketplace)
    await (
      await marketplace.giftNFT(nft.address, receiver, nftItem.tokenId)
    ).wait()
    loadItem()
  }

  useEffect(async () => {
    try {
      await loadItem()
    } catch (error) {
      console.log('error', error)
      setError(error)
      setLoading(false)
    }
  }, [])

  if (renderLoadingAndError(loading, error))
    return renderLoadingAndError(loading, error)

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
              {nftItem.onSale ? (
                <Card>
                  <Card.Img variant="top" src={nftItem.image} />
                  <Card.Body color="secondary">
                    <Card.Title>TokenId: {nftItem.tokenId}</Card.Title>
                    <Card.Title>Name: {nftItem.name}</Card.Title>
                    <Card.Text>Description: {nftItem.description}</Card.Text>
                    <Card.Title>
                      Price: {ethers.utils.formatEther(nftItem.price)}
                    </Card.Title>
                    <Card.Title>
                      Owner:
                      <Link to={'/history/' + nftItem.seller}>
                        {getShortAddress(nftItem.seller)}
                      </Link>
                    </Card.Title>
                  </Card.Body>
                  {nftItem.seller.toLowerCase() !== account ? (
                    <Card.Footer>
                      <div className="d-grid">
                        <Button
                          onClick={() => buyMarketItem(nftItem)}
                          variant="primary"
                          size="lg"
                        >
                          Buy for {ethers.utils.formatEther(nftItem.price)} ETH
                        </Button>
                      </div>
                    </Card.Footer>
                  ) : (
                    <Card.Footer>
                      <div className="d-grid">
                        <Button
                          onClick={() => cancelItem(nftItem)}
                          variant="primary"
                          size="lg"
                        >
                          Cancel Sale
                        </Button>
                      </div>
                    </Card.Footer>
                  )}
                </Card>
              ) : (
                <Card>
                  <Card.Img variant="top" src={nftItem.image} />
                  <Card.Body color="secondary">
                    <Card.Title>TokenId: {nftItem.tokenId}</Card.Title>
                    <Card.Title>Name: {nftItem.name}</Card.Title>
                    <Card.Text>Description: {nftItem.description}</Card.Text>
                    <Card.Title>
                      Owner:
                      <Link to={'/history/' + nftItem.owner}>
                        {/* {nftItem.owner}//TODO */}
                        {getShortAddress(nftItem.owner)}
                      </Link>
                    </Card.Title>

                    {nftItem.owner === account ? (
                      <Row>
                        <Form.Control
                          onChange={(e) => setPrice(e.target.value)}
                          size="lg"
                          required
                          type="number"
                          placeholder="Price in ETH"
                        />
                        <Button onClick={sellItem} variant="primary" size="lg">
                          Sell
                        </Button>
                        <Form.Control
                          onChange={(e) => setReceiver(e.target.value)}
                          size="lg"
                          required
                          type="string"
                          placeholder="Receiver's address"
                        />
                        <Button onClick={giftNFT} variant="primary" size="lg">
                          Gift
                        </Button>
                      </Row>
                    ) : (
                      <div></div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Row>
          </div>
        </main>
      </div>
    </div>
  )
}
