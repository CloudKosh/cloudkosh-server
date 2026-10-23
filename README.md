# CloudKosh-server
Storage server aggregator - Simple Storage API on the top of cross cloud storage

This server contains smallest installation that runs on VPS with primary and secondary replicated storage along with local cache.

# Features

1. Storage Namespaces - collection of buckets that share same access keys and deduplicated object items with single encryption key.
2. Storage Buckets - Buckets under namespace.
3. AccessKeys - Access Keys for Namespaces.
4. For isolated buckets, create separate namespaces.
5. Storage Buckets can be replicated separately. But namespace level replication is recommended. Import/Export operations.

