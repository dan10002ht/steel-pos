import React from 'react';
import {
  Tr,
  Td,
  VStack,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import ProductSearch from '../../ProductSearch';
import FormSelect from '../../atoms/FormSelect';
import FormNumberInput from '../../atoms/FormNumberInput';
import { formatCurrency } from '../../../utils/formatters';

const ProductRow = ({
  product,
  index,
  onProductSelect,
  onVariantSelect,
  onProductChange,
  onRemove,
  isEditing,
  isDisabled,
}) => {
  console.log(product);
  return (
    <Tr>
      <Td>
        <VStack align='start' spacing={2}>
          <ProductSearch
            onSelect={selectedProduct => onProductSelect(index, selectedProduct)}
            placeholder='Chọn sản phẩm'
            initialValue={
              isEditing && product.productId
                ? {
                    id: product.productId,
                    name: product.productName,
                    unit: product.unit,
                  }
                : null
            }
          />
        </VStack>
      </Td>
      
      <Td>
        <FormSelect
          placeholder='Chọn phân loại'
          value={product.variant || ''}
          onChange={e => {
            const selectedVariant = product.variants?.find(
              v => v.name === e.target.value
            );
            if (selectedVariant) {
              onVariantSelect(index, selectedVariant);
            }
          }}
          size='sm'
        >
          {product?.variants && product.variants.length > 0 ? (
            product.variants.map(variant => (
              <option key={variant.id} value={variant.name}>
                {variant.name}
              </option>
            ))
          ) : (
            <option value="">Không có variants</option>
          )}
        </FormSelect>
      </Td>
      
      <Td>
        <FormNumberInput
          value={product.quantity}
          onChange={value =>
            onProductChange(index, 'quantity', parseInt(value) || 0)
          }
          min={0}
          size='sm'
        />
      </Td>
      
      <Td>
        <FormNumberInput
          value={product.unitPrice}
          onChange={value =>
            onProductChange(index, 'unitPrice', parseFloat(value) || 0)
          }
          min={0}
          size='sm'
        />
      </Td>
      
      <Td>
        <Text fontWeight='bold' color='blue.600'>
          {formatCurrency(product.total)}
        </Text>
      </Td>
      
      <Td>
        <IconButton
          icon={<Trash2 size={14} />}
          colorScheme='red'
          variant='ghost'
          size='sm'
          onClick={() => onRemove(index)}
          isDisabled={isDisabled}
        />
      </Td>
    </Tr>
  );
};

export default ProductRow;
