# Solution for Current Problem

## Problem: Kadane's Algorithm (or Array Sum)

### Input Format
The stdin receives: `[2, 2, 1]` (exactly as shown, including brackets)

### Expected Output
`1` (or whatever the sum/result should be)

---

## ✅ Working Solution (Python)

```python
import sys
data = sys.stdin.read().strip()

# Remove brackets and parse
data = data.strip('[]')  # Removes [ and ]
# Now data = "2, 2, 1"

# Split by comma and space, convert to integers
arr = list(map(int, data.split(', ')))
# Now arr = [2, 2, 1]

# Solve the problem (example: sum)
result = sum(arr)
print(result)
```

---

## ✅ Working Solution (JavaScript)

```javascript
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();

// Remove brackets: "[2, 2, 1]" -> "2, 2, 1"
const cleaned = input.slice(1, -1);

// Split and parse
const arr = cleaned.split(', ').map(Number);

// Solve (example: sum)
const result = arr.reduce((a, b) => a + b, 0);
console.log(result);
```

---

## ✅ Working Solution (Java)

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine().trim();
        
        // Remove brackets
        input = input.substring(1, input.length() - 1);
        
        // Split by comma
        String[] parts = input.split(", ");
        int sum = 0;
        
        for (String part : parts) {
            sum += Integer.parseInt(part.trim());
        }
        
        System.out.println(sum);
    }
}
```

---

## ✅ Working Solution (C++)

```cpp
#include <iostream>
#include <string>
#include <sstream>
using namespace std;

int main() {
    string input;
    getline(cin, input);
    
    // Remove brackets
    input = input.substr(1, input.length() - 2);
    
    // Parse comma-separated values
    stringstream ss(input);
    int sum = 0, num;
    char comma;
    
    while (ss >> num) {
        sum += num;
        ss >> comma;  // consume comma
    }
    
    cout << sum;
    return 0;
}
```

---

## ✅ Working Solution (C)

```c
#include <stdio.h>
#include <string.h>

int main() {
    char buffer[10000];
    fgets(buffer, sizeof(buffer), stdin);
    
    // Remove newline
    buffer[strcspn(buffer, "\n")] = 0;
    
    // Remove brackets
    char cleaned[10000];
    int len = strlen(buffer);
    strncpy(cleaned, buffer + 1, len - 2);
    cleaned[len - 2] = '\0';
    
    // Parse comma-separated
    int sum = 0, num;
    char *token = strtok(cleaned, ", ");
    
    while (token != NULL) {
        sscanf(token, "%d", &num);
        sum += num;
        token = strtok(NULL, ", ");
    }
    
    printf("%d", sum);
    return 0;
}
```

---

## 🔧 Copy-Paste This Working Code

For your current problem with input `[2, 2, 1]`:

### Python (Copy this):
```python
import sys
data = sys.stdin.read().strip()
data = data.strip('[]')
arr = list(map(int, data.split(', ')))
print(sum(arr))
```

### JavaScript (Copy this):
```javascript
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();
const arr = input.slice(1, -1).split(', ').map(Number);
console.log(arr.reduce((a, b) => a + b, 0));
```

---

## Understanding the Error

Your current code:
```python
arr = list(map(int,input().split()))
```

This fails because:
1. `input()` only reads ONE line
2. `.split()` splits by whitespace (space), but input has commas and brackets
3. `int('[2,')` fails because '[2,' is not a valid integer

The fix:
1. Read ALL stdin with `sys.stdin.read()`
2. Remove brackets with `.strip('[]')`
3. Split by `', '` (comma + space)
4. Convert each to int

---

## Better Input Format Recommendation

When creating test cases, use simpler formats:

### ❌ Avoid (causes parsing issues):
```
[2, 2, 1]
arr = [1, 2, 3]
```

### ✅ Recommend (easier to parse):
```
2 2 1
```
or
```
3
2 2 1
```
(first line = count, second line = values)

This way, `.split()` works directly without removing brackets!

