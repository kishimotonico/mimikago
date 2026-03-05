use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UrlEntry {
    pub label: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Track {
    pub title: String,
    pub file: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Playlist {
    pub name: String,
    pub tracks: Vec<Track>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetaFile {
    pub id: String,
    pub title: String,
    #[serde(default)]
    pub urls: Vec<UrlEntry>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cover_image: Option<String>,
    #[serde(default)]
    pub playlists: Vec<Playlist>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_playlist: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Work {
    pub id: String,
    pub title: String,
    pub cover_image: Option<String>,
    pub default_playlist: Option<String>,
    pub created_at: Option<String>,
    pub status: String,
    pub physical_path: String,
    pub total_duration_sec: i64,
    pub added_at: String,
    pub error_message: Option<String>,
    pub urls: Vec<UrlEntry>,
    pub tags: Vec<String>,
    pub playlists: Vec<Playlist>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkSummary {
    pub id: String,
    pub title: String,
    pub cover_image: Option<String>,
    pub status: String,
    pub physical_path: String,
    pub total_duration_sec: i64,
    pub added_at: String,
    pub error_message: Option<String>,
    pub urls: Vec<UrlEntry>,
    pub tags: Vec<String>,
    pub track_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub registered: usize,
    pub newly_generated: usize,
    pub errors: usize,
    pub missing: usize,
    pub new_work_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SortOption {
    pub field: String,
    pub direction: String,
}
