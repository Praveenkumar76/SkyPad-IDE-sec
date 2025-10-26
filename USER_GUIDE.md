# SkyPad IDE - User Guide for Problem Management

## How to Upload Problems

1. **Navigate to Upload Question** page from Dashboard
2. Fill in the problem details:
   - **Title**: Name of your problem
   - **Difficulty**: Easy, Medium, or Hard
   - **Description**: Detailed problem statement
   - **Constraints**: Input/output constraints
   - **Tags**: Add relevant tags for DSA categorization
   - **Time/Memory Limits**: Execution limits
   - **Languages**: Select allowed programming languages
   - **Sample Test Cases**: Visible to users
   - **Hidden Test Cases**: Used for evaluation

3. **Add DSA Tags** (Important for auto-sync!)
   - Use these tags to automatically categorize your problem:
     - `array` - Array problems
     - `string` - String manipulation
     - `tree` - Tree data structures
     - `graph` - Graph algorithms
     - `recursion` - Recursive solutions
     - `linkedlist` - Linked list problems
     - `stack` - Stack problems
     - `queue` - Queue problems
     - `dp` or `dynamic-programming` - Dynamic programming
     - `greedy` - Greedy algorithms

4. **Submit** - Your problem will automatically:
   - Appear in the **Problems** section
   - Sync to the **DSA Sheet** if tags match
   - Be visible to all users immediately

## Viewing All Problems

### Problems Page
- Shows **ALL** problems from the database
- Filter by difficulty (Easy, Medium, Hard)
- Search by title, description, or tags
- Click any problem to solve it
- Manual "Sync to DSA" button available if needed

### DSA Sheet
- Organized by topics
- Shows only problems with matching tags
- Track your progress per topic
- Manual "Refresh" button to re-sync

## Example: Creating an Array Problem

```
Title: Two Sum
Difficulty: Easy
Description: Given an array of integers, return indices of two numbers that add up to target.
Tags: array, two-pointers
Sample Test Case:
  Input: [2,7,11,15], target = 9
  Output: [0,1]
```

This problem will automatically appear in:
1. Problems page (all problems)
2. DSA Sheet under "Array" topic

## Tips

✅ **Use correct tags** for automatic DSA categorization  
✅ **All problems are fetched** - no need to paginate  
✅ **Auto-refresh** - UI updates immediately after upload  
✅ **Multiple tags** - Use comma-separated tags (e.g., `array, sorting, binary-search`)  
✅ **No manual sync needed** - Everything is automatic!  

## Troubleshooting

**Problem not in DSA Sheet?**
- Check if you used the correct tags (see list above)
- Click "Sync to DSA" button on Problems page
- Click "Refresh" button on DSA Sheet page

**Not all problems showing?**
- The system now fetches all problems by default
- If you still see only 10, try refreshing the page
- Check browser console for any errors

**Problem not appearing immediately?**
- Refresh the page
- The auto-refresh should work, but manual refresh always works
