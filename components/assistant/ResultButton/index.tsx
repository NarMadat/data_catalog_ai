import * as React from 'react'
import { Col, Row } from 'antd'

interface ResultButtonProps {
  dataProvider: string
  dataProviderUnit: string
  dataType: string
  dataName: string
  onClick: (dataName: string) => void
  full: boolean
}

const ResultButton: React.FC<ResultButtonProps> = ({
  dataProvider,
  dataProviderUnit,
  dataType,
  dataName,
  onClick,
  full
}) => {
  return (
    <>
      {!full ? (
        <button
          onClick={() => onClick(dataName)}
          className="bg-amber-300 text-black p-2 rounded text-xs"
        >
          {dataType} {'->'} {dataName}
        </button>
      ) : (
        <Row>
          <Col xs={24}>
            <p className="bg-green-100 text-black p-2 rounded text-xs">
              {dataProvider} {'֊֊֊>'} {dataProviderUnit} {'֊֊֊>'} {dataType}{' '}
              {'֊֊֊>'}
              {dataName}
            </p>
          </Col>
        </Row>
      )}
    </>
  )
}

export default ResultButton
