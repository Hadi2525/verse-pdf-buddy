
from pymongo import MongoClient
from pymongo.collection import Collection
from core.config import MONGODB_CONNECTION_STRING, MONGODB_DATABASE, \
                            MONGODB_COLLECTION, EMBEDDING_MODEL, \
                            MONGODB_SEARCH_INDEX_NAME, MONGODB_SEARCH_TOP_K, \
                            MONGODB_VECTOR_EMBEDDING_PATH
from utils.format_request import format_inserts
import ollama


class VectorDB:
    def __init__(self):
        """
        Initialize the VectorDB connection, database, and collection
        Args:
            connection_string (str): Connection string to the MongoDB database
            database (str): Name of the MongoDB database
            collection (str): Name of the MongoDB collection
            
        """
        self.mongodb_client = MongoClient(MONGODB_CONNECTION_STRING)
        self.db = self.mongodb_client[MONGODB_DATABASE]
        self.collection: Collection = self.db[MONGODB_COLLECTION]
        self.aembeddings = ollama.AsyncClient()

    def ping(self):
        """
        Check if the MongoDB connection is active"""
        return self.mongodb_client.admin.command('ping')

    def insert(self, data):
        """
        Insert data into the MongoDB collection
        Args:
            data (dict): Data to be inserted into the collection
        
        Returns:
            bool: True if the data was successfully inserted, False otherwise
        """
        formatted_data = format_inserts(data)

        if self.collection.insert_one(formatted_data):
            return True
        return False

    async def find(self, data, top_searches: int = 5):
        """
        Find data in the MongoDB collection
        """
        aembeddings = await self.aembeddings.embed(model= EMBEDDING_MODEL,
                                                  input = data)
        embeddings = aembeddings["embeddings"][0]

        pipeline = [
            {
                "$vectorSearch": {
                    "index": MONGODB_SEARCH_INDEX_NAME,
                    "queryVector": embeddings,
                    "path": MONGODB_VECTOR_EMBEDDING_PATH,
                    "exact": True,
                    "limit": top_searches
                }
            },
            {"$project": {
                "_id": 0, #Excluded
                "document_embedding": 0, #Excluded
                "timestamp": 0, #Excluded
                "search_score": { "$meta": "vectorSearchScore"}
            }}
        ]
        
        return list(self.collection.aggregate(pipeline))

    #TODO: Implement update and delete methods
    # def update(self, query, data):
    #     """
    #     Update data in the MongoDB collection"""
    #     self.collection.update_one(query, {'$set': data})

    # def delete(self, query):
    #     """
    #     Delete data in the MongoDB collection"""
    #     self.collection.delete_one(query)