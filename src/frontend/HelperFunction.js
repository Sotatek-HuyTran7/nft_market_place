import { Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'

export function getShortAddress(address) {
  if (!address) return 'no owner'
  return address.slice(0, 5) + '...' + address.slice(38)
}
export function renderCardItem(item) {
  if(!item) return 
  return (
    <Card>
      <Link to={'/nft-detail/' + item.tokenId}>
        <Card.Header>
          <Card.Title>#{item.tokenId}</Card.Title>
        </Card.Header>
        <Card.Img variant="top" src={item.image} />
        <Card.Body color="secondary">
          <Card.Title>{item.name}</Card.Title>
          <Card.Text>{item.description}</Card.Text>
          {'price' in item ? (
            <Card.Text>
              Price: {ethers.utils.formatEther(item.price)} ETH
            </Card.Text>
          ) : (
            <Card.Text></Card.Text>
          )}
        </Card.Body>
      </Link>
    </Card>
  )
}
export function renderLoadingAndError(loading, error) {
  if (loading)
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    )
  if (error)
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>This Page is error: {error.data.message}</h2>
      </main>
    )
  return null
}

//async function

export async function isApprovedForAll(nft, account, marketplace) {
  if (!(await nft.isApprovedForAll(account, marketplace.address))) {
    await (await nft.setApprovalForAll(marketplace.address, true)).wait()
  }
}

export async function getEventTimestamp(eventResult) {
  const blockDetail = await eventResult.getBlock()
  return blockDetail.timestamp
}
export async function getMetadata(nft, tokenId) {
  const uri = await nft.tokenURI(tokenId)
  const response = await fetch(uri)
  const metadata = await response.json()

  return metadata
}
