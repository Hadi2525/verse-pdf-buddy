from dotenv import load_dotenv
import os
from pymongo.mongo_client import MongoClient
from pymongo.operations import SearchIndexModel

import time

_ = load_dotenv()

# Connect to your Atlas deployment
uri = os.getenv("MONGODB_CONNECTION_STRING")
EMBEDDINGS_SIZE = int(os.getenv("EMBEDDINGS_SIZE"))
client = MongoClient(uri)

# Access your database and collection
database = client[os.getenv("MONGODB_DATABASE")]
collection = database[os.getenv("MONGODB_COLLECTION")]

index_name = os.getenv("MONGODB_SEARCH_INDEX_NAME")

index_exists = any(index['name'] == index_name for index in collection.list_search_indexes())

if index_exists:
  collection.drop_search_index(os.getenv("MONGODB_SEARCH_INDEX_NAME"))
else:

  # Create your index model, then create the search index
  search_index_model = SearchIndexModel(
    definition={
      "fields": [
        {
          "type": "vector",
          "numDimensions": EMBEDDINGS_SIZE,
          "path": os.getenv("MONGODB_VECTOR_EMBEDDING_PATH"),
          "similarity": "cosine",
          "quantization": "scalar"
        }
      ]
    },
    name=os.getenv("MONGODB_SEARCH_INDEX_NAME"),
    type="vectorSearch"
  )

  result = collection.create_search_index(model=search_index_model)
  print("New search index named " + result + " is building.")

  # Wait for initial sync to complete
  print("Polling to check if the index is ready. This may take up to a minute.")
  predicate=None
  if predicate is None:
    predicate = lambda index: index.get("queryable") is True

  while True:
    indices = list(collection.list_search_indexes(result))
    if len(indices) and predicate(indices[0]):
      break
    time.sleep(5)
  print(result + " is ready for querying.")

  client.close()
