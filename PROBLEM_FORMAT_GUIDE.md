# Problem Input/Output Format Guide

## ⚠️ Important: How Test Cases Work

### The Issue You're Seeing

If you see test input like:
```
arr = [1]
```

This is **NOT** the actual stdin input your program receives! This is just showing you what the array looks like in pseudocode.

### What Your Program Actually Receives

Your program receives **raw text via stdin**. For the example above, the actual stdin would be:
```
1
```

or for an array:
```
1, 2, 3, 4
```

or sometimes:
```
4
1 2 3 4
```

### How to Fix Your Code

#### ❌ Wrong Approach:
```python
# This will FAIL because stdin is NOT Python code
arr = list(map(int,input().split()))  # If input is "arr = [1]", this breaks!
print(sum(arr))
```

#### ✅ Correct Approach:
```python
# Read the actual stdin (which might be "1" or "1, 2, 3, 4")
import sys
data = sys.stdin.read().strip()

# Parse based on the actual format
# Option 1: If input is comma-separated "1, 2, 3, 4"
arr = list(map(int, data.split(', ')))

# Option 2: If input is space-separated "1 2 3 4"  
arr = list(map(int, data.split()))

# Option 3: If input is just a single number "1"
arr = [int(data)]

# Then solve and output
print(sum(arr))
```

## Language-Specific Examples

### JavaScript
```javascript
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();

// Parse based on format
const arr = input.split(',').map(x => parseInt(x.trim()));
// OR: const arr = input.split(' ').map(Number);
// OR: const arr = [parseInt(input)];

console.log(arr.reduce((a,b) => a+b, 0));
```

### Python
```python
import sys
data = sys.stdin.read().strip()

# Parse the input
arr = list(map(int, data.split(',')))  # for comma-separated
# OR: arr = list(map(int, data.split()))  # for space-separated
# OR: arr = [int(data)]  # for single number

print(sum(arr))
```

### Java
```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine().trim();
        
        // Parse based on format
        String[] parts = input.split(",");
        int sum = 0;
        for (String part : parts) {
            sum += Integer.parseInt(part.trim());
        }
        
        System.out.println(sum);
    }
}
```

### C++
```cpp
#include <iostream>
#include <sstream>
#include <vector>
using namespace std;

int main() {
    string line;
    getline(cin, line);
    
    // Parse comma-separated
    stringstream ss(line);
    int sum = 0, num;
    char comma;
    
    while (ss >> num) {
        sum += num;
        ss >> comma; // skip comma
    }
    
    cout << sum;
    return 0;
}
```

### C
```c
#include <stdio.h>
#include <string.h>

int main() {
    char buffer[10000];
    fgets(buffer, sizeof(buffer), stdin);
    
    // Parse comma-separated
    int sum = 0, num;
    char *token = strtok(buffer, ",");
    while (token != NULL) {
        sscanf(token, "%d", &num);
        sum += num;
        token = strtok(NULL, ",");
    }
    
    printf("%d", sum);
    return 0;
}
```

## How to Create Proper Test Cases

When uploading a problem, make sure test inputs are in **plain stdin format**:

### ✅ Good Test Cases:
- **Input**: `5` → **Output**: `120` (for factorial)
- **Input**: `1 2 3 4` → **Output**: `10` (for array sum)
- **Input**: `4\n1 2 3 4` → **Output**: `10` (first line = count, second line = array)

### ❌ Bad Test Cases:
- **Input**: `arr = [1, 2, 3, 4]` ❌ (This is Python syntax, not stdin!)
- **Input**: `n = 5` ❌ (This is variable assignment, not stdin!)

## Summary

1. **Test inputs are RAW TEXT via stdin** - not Python/JavaScript code
2. **Your program must PARSE the raw text** according to the problem's input format
3. **Check the problem description** to understand the exact input format
4. **All languages are supported**: JavaScript, Python, Java, C++, C
5. **Use the Reset button** to clear your code and start fresh
6. **Check the hint bar** above the editor for language-specific stdin reading methods

## Compiler Requirements

Make sure these are installed on the server:
- **JavaScript**: Node.js
- **Python**: Python 3
- **Java**: JDK 11+ (javac and java commands)
- **C**: GCC compiler
- **C++**: G++ compiler

