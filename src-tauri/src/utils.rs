//! Vi Chi - Utility functions

/// Format số tiền thành chuỗi VNĐ với dấu phân cách hàng nghìn
/// Ví dụ: 50000 -> "50.000 ₫"
pub fn dinh_dang_tien(so_tien: i64) -> String {
    if so_tien == 0 {
        return "0 ₫".to_string();
    }

    let mut result = String::new();
    let mut so = so_tien.abs();
    let am = so_tien < 0;

    // Chia thành các nhóm 3 chữ số
    let mut groups = Vec::new();
    while so > 0 {
        groups.push(so % 1000);
        so /= 1000;
    }

    // Ghép lại với dấu chấm
    for (i, group) in groups.iter().rev().enumerate() {
        if i > 0 {
            result.push('.');
        }
        if i == groups.len() - 1 {
            result.push_str(&group.to_string());
        } else {
            result.push_str(&format!("{:03}", group));
        }
    }

    if am {
        result.insert(0, '-');
    }
    result.push_str(" ₫");
    result
}

/// Format số tiền không có ký tự ₫ (dùng cho CSV)
pub fn dinh_dang_tien_khong_ky_tu(so_tien: i64) -> String {
    dinh_dang_tien(so_tien).replace(" ₫", "")
}

/// Format số tiền có dấu
pub fn dinh_dang_tien_co_dau(so_tien: i64) -> String {
    let dau = if so_tien >= 0 { "+" } else { "" };
    format!("{}{}", dau, dinh_dang_tien(so_tien.abs()))
}