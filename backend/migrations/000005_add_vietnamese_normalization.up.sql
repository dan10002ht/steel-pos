-- Create Vietnamese normalization function
CREATE OR REPLACE FUNCTION normalize_vietnamese(text) 
RETURNS text AS $$
BEGIN
  RETURN lower(
    translate($1, 
      'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ',
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeiiiiioooooooooooooouuuuuuuuuuyyyyydaaaaaaaaaaaaaaaaaeeeeeeeeeeiiiiioooooooooooooouuuuuuuuuuyyyyyd'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create functional index for normalized product names
CREATE INDEX idx_products_name_normalized 
ON products (normalize_vietnamese(name));

-- Create functional index for normalized variant names
CREATE INDEX idx_product_variants_name_normalized 
ON product_variants (normalize_vietnamese(name));

-- Create functional index for normalized variant SKUs
CREATE INDEX idx_product_variants_sku_normalized 
ON product_variants (normalize_vietnamese(sku));
