# How to Manually Build .exe and .dmg

If the build did not start automatically, follow these steps to trigger it manually on GitHub.

## Prerequisites
1.  **Push the Code:** Ensure this code has been pushed to your GitHub repository.
    ```bash
    git push origin main
    ```

## Steps to Trigger Build

1.  Open your **GitHub Repository** page in a web browser.
2.  Click the **Actions** tab at the top.
3.  In the left sidebar, click **"Build ArchNative Release"**.
4.  You will see a blue banner: "This workflow has a `workflow_dispatch` event trigger."
5.  Click the **Run workflow** button on the right side.
6.  Select the **Branch: main** and click the green **Run workflow** button.

## How to Download Files

1.  Wait for the build to finish (approx 10-15 minutes).
2.  Click on the completed run (e.g., "Build ArchNative Release #1").
3.  Scroll down to the **Artifacts** section at the bottom.
4.  Click **ArchNative-Windows** to download the `.exe` (Zip).
5.  Click **ArchNative-macOS** to download the `.dmg`.
