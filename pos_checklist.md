# Checklist Xây Dựng Ứng Dụng POS Cho Cửa Hàng Sắt Thép

## 1. Phân tích & Thiết kế hệ thống

- [ ] Xác định các loại người dùng (admin, nhân viên bán hàng, kế toán, v.v.)
- [ ] Xác định các phân hệ chính: Sản phẩm, Kho, Đơn hàng, Khách hàng, Người dùng, Báo cáo
- [ ] Thiết kế sơ đồ ERD (Entity Relationship Diagram) cho database
- [ ] Xác định các trạng thái đơn hàng (mới, đã thanh toán, thanh toán một phần, nợ, đã hủy, hoàn thành, ...)
- [ ] Xác định các trạng thái thanh toán (chưa thanh toán, thanh toán một phần, đã thanh toán)
- [ ] Xác định các loại giao dịch kho (nhập, xuất, điều chỉnh, chuyển kho)

---

## 2. Quản lý sản phẩm

- [ ] Thêm/sửa/xóa sản phẩm
- [ ] Phân loại sản phẩm (theo loại, nhóm, thương hiệu, quy cách, v.v.)
- [ ] Quản lý giá bán, giá nhập, giá vốn
- [ ] Quản lý tồn kho từng sản phẩm
- [ ] Quản lý đơn vị tính (kg, cây, tấm, cuộn, mét, v.v.)
- [ ] Quản lý mã vạch/mã sản phẩm

---

## 3. Quản lý kho

- [ ] Nhập kho (từ nhà cung cấp)
- [ ] Xuất kho (bán hàng, chuyển kho, xuất hủy)
- [ ] Điều chỉnh tồn kho (kiểm kê, sai lệch)
- [ ] Lịch sử nhập xuất tồn kho
- [ ] Báo cáo tồn kho theo thời gian thực

---

## 4. Quản lý đơn hàng (Order)

- [ ] Tạo đơn hàng mới
- [ ] Thêm/sửa/xóa sản phẩm trong đơn hàng
- [ ] Quản lý trạng thái đơn hàng (mới, đang xử lý, hoàn thành, hủy)
- [ ] Quản lý trạng thái thanh toán (chưa thanh toán, thanh toán một phần, đã thanh toán)
- [ ] Hỗ trợ thanh toán nhiều lần cho một đơn hàng (partial payment)
- [ ] Ghi nhận lịch sử thanh toán cho từng đơn hàng
- [ ] Ghi chú, file đính kèm cho đơn hàng (nếu cần)
- [ ] In/xuất hóa đơn

---

## 5. Quản lý khách hàng

- [ ] Thêm/sửa/xóa thông tin khách hàng
- [ ] Quản lý công nợ khách hàng
- [ ] Lịch sử mua hàng của khách
- [ ] Báo cáo công nợ, nhắc nợ

---

## 6. Quản lý người dùng & phân quyền

- [ ] Thêm/sửa/xóa người dùng
- [ ] Phân quyền theo vai trò (admin, nhân viên, kế toán, ...)
- [ ] Lịch sử hoạt động của người dùng (audit log)

---

## 7. Báo cáo & Thống kê

- [ ] Báo cáo doanh thu theo ngày/tháng/năm
- [ ] Báo cáo tồn kho
- [ ] Báo cáo nhập xuất tồn
- [ ] Báo cáo công nợ khách hàng
- [ ] Báo cáo lợi nhuận
- [ ] Báo cáo lịch sử giao dịch

---

## 8. Tính năng bổ sung (nếu cần)

- [ ] Tích hợp máy in hóa đơn
- [ ] Tích hợp quét mã vạch
- [ ] Hỗ trợ nhiều chi nhánh/kho
- [ ] Hỗ trợ xuất/nhập dữ liệu (Excel, CSV)
- [ ] Tích hợp SMS/Email thông báo

---

## 9. UI/UX

- [ ] Thiết kế giao diện thân thiện, dễ sử dụng cho nhân viên bán hàng
- [ ] Tối ưu thao tác nhập liệu nhanh
- [ ] Responsive cho máy tính bảng, điện thoại (nếu cần)

---

## 10. Bảo mật & Sao lưu

- [ ] Xác thực, phân quyền truy cập
- [ ] Sao lưu dữ liệu định kỳ
- [ ] Ghi log hoạt động hệ thống
