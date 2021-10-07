# fulibFeedback

## General Plan

1. Fetch all PM assignment repos from sekassel and sekassel-archive
2. Read through comments of Pull Requests, e.g.

    ```markdown
    ClemensEmme commented on 18 Jan:
    # Hausaufgabe 3 (56P/100P)
    ## Aufgabe 1 (19P/60P)
    ### Dungeon (7P/13P)
    #### withEnemies
    - Null nicht abgefangen (-1P)
    ```

   This yields the following info:

   1. feedback author (GitHub username)
   2. assignment number, total points
   3. task number, subtotal
   4. subtask, in this case class name
   5. in this case method name
   6. deduction with reason and points

3. Find out how to map deductions to problems in code
   > This requires some intelligence or at least a probabilistic approach that looks at multiple submissions with the same deductions and checks for simililarities.

4. Check for similar issues in student's code - either live in their editor if permitted, or during grading.
5. Add an interface for collecting feedback and generating PR comments in the format above.
