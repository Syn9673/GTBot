import { Component } from 'react'
import { Card, CardHeader, CardBody, Col } from 'reactstrap'

class _Card extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Card className='bg-gradient-dark mb-2'>
        <CardHeader
          className='bg-gradient-dark text-center'
          style={
            { padding: 0 }
          }
        >
          <h3 className='text-light'>{this.props.header}</h3>
        </CardHeader>
        <CardBody>
          {this.props.children}
        </CardBody>
      </Card>
    )
  }
}

export default _Card