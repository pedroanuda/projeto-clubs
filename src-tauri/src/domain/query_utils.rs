pub fn define_limit_and_offset(query: &mut String, limit: Option<u32>, offset: Option<u32>) {
    if let Some(l) = limit {
        query.push_str(&format!(" LIMIT {l}"));

        if let Some(o) = offset {
            query.push_str(&format!(" OFFSET {o}"));
        }
    }
}
