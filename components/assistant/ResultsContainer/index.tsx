import * as React from 'react'
import ResultButton from '@/components/assistant/ResultButton'
import { Col, Row } from 'antd'

interface ResultsContainerProps {
  json: Array<{
    data_provider: string
    data_provider_unit: string
    data_type: string
    data_name: string
  }>
  showResults: boolean
  onButtonClick: (dataName: string) => void
  full: boolean
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({
  json,
  showResults,
  onButtonClick,
  full
}) => {
  let test = [
    {
      id: 1781,
      data_provider: 'ՀՀ Աշխատանքի և սոցիալական հարցերի նախարարություն',
      data_provider_unit: '«Նորք» տեխնոլոգիաների կենտրոն',
      system: 'Դիմումների հաշվառման միասնական համակարգ',
      data_type: 'Շահառու',
      data_name: 'բնակարան'
    },
    {
      id: 2510,
      data_provider: 'ՀՀ Աշխատանքի և սոցիալական հարցերի նախարարություն',
      data_provider_unit: '«Նորք» տեխնոլոգիաների կենտրոն',
      system: 'Աջակցող միջոցների տրամադրման տեղեկատվական համակարգ',
      data_type: 'Անձնական տվյալներ',
      data_name: 'բնակարան'
    },
    {
      id: 1752,
      data_provider: 'ՀՀ Աշխատանքի և սոցիալական հարցերի նախարարություն',
      data_provider_unit: '«Նորք» տեխնոլոգիաների կենտրոն',
      system: 'Դիմումների հաշվառման միասնական համակարգ',
      data_type: 'Դիմումատու',
      data_name: 'բնակարան'
    },
    {
      id: 1720,
      data_provider: 'ՀՀ Աշխատանքի և սոցիալական հարցերի նախարարություն',
      data_provider_unit: '«Նորք» տեխնոլոգիաների կենտրոն',
      system: 'Բարեգործական ծրագրերի հաշվառման տեղեկատվական համակարգ',
      data_type: 'Օգնության կարիք ունեցող',
      data_name: 'բնակարան'
    },
    {
      id: 2466,
      data_provider: 'ՀՀ Աշխատանքի և սոցիալական հարցերի նախարարություն',
      data_provider_unit: '«Նորք» տեխնոլոգիաների կենտրոն',
      system: 'Մանուկ',
      data_type: 'Որդեգրող',
      data_name: 'բնակարան'
    },
    {
      id: 5926,
      data_provider: 'ՀՀ Աշխատանքի և սոցիալական հարցերի նախարարություն',
      data_provider_unit: 'Միասնական սոցիալական ծառայության',
      system: 'Էլեկտրոնային կենսաթոշակ',
      data_type: 'Հասցե',
      data_name: 'բնակարան'
    }
  ]

  return (
    <Row
      gutter={[12, 12]}
      id="resultsContainer"
      className={'bg-gray-200 p-4 rounded'}
    >
      <Col xs={24}>{!full && <h2>Ընտրել տարբերակներից:</h2>}</Col>

      {json.map(item => (
        <Col
          key={
            'item-' +
            item.data_name +
            'item.data_provider_unit' +
            item.data_provider_unit +
            item.data_provider_unit +
            item.data_type
          }
        >
          <ResultButton
            key={item.data_name}
            dataProvider={item.data_provider}
            dataProviderUnit={item.data_provider_unit}
            dataType={item.data_type}
            dataName={item.data_name}
            onClick={onButtonClick}
            full={full}
          />
        </Col>
      ))}
    </Row>
  )
}

export default ResultsContainer
