from pymongo import MongoClient

# --- IMPORTANT: CONFIGURE THESE VALUES ---
MONGO_URI = "mongodb+srv://05erwinsmith06:05Abinesh06@skypad-ide.cl8fsko.mongodb.net/skypadDB?retryWrites=true&w=majority&appName=Skypad-IDE"
DATABASE_NAME = "skypadDB"
PROBLEM_TITLE = "Hello world"
# -----------------------------------------

# The new hidden test case to be added
new_hidden_test_cases = [
    {
      "input": "",
      "expectedOutput": "Hello World"
    }
]

# --- Main script ---
try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    problems_collection = db.problems
    
    print(f"Searching for problem: '{PROBLEM_TITLE}'...")
    
    # Update the document directly
    result = problems_collection.update_one(
        {"title": PROBLEM_TITLE},
        {"$set": {"hiddenTestCases": new_hidden_test_cases}}
    )
    
    if result.matched_count == 0:
        print(f"❌ Error: Could not find the problem with title '{PROBLEM_TITLE}'.")
    elif result.modified_count > 0:
        print(f"🎉 Successfully added hidden test cases to '{PROBLEM_TITLE}'.")
    else:
        print("No changes were needed. The test cases might already be correct.")
        
    client.close()
except Exception as e:
    print(f"An error occurred: {e}")