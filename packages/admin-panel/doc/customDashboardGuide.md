# Creating a Custom Dashboard in Tupaia

This guide explains, in plain language, how to assemble a dashboard item that appears on [tupaia.org](https://tupaia.org). All steps happen inside the Admin Panel (`admin.tupaia.org`) and rely on the Visualisation Builder.

## 1. Confirm you have access
- You must be able to open the **Visualisations** tab in the Admin Panel and have the **Viz Builder User** permission group; otherwise the “Add dashboard item” button and the builder itself stay hidden.
- If you do not see the Visualisation Builder links, ask someone with BES Admin rights to grant you Viz Builder access. This cannot be done through the public site.

## 2. Open the Visualisation Builder
- Go to **Visualisations → Dashboard items** and choose **Add dashboard item** (or open an existing item and click **View in Visualisation Builder**).
- A “Create new visualisation” card appears. Fill in:
  - **Code**: A short identifier you will remember later.
  - **Name**: The title people will see on the dashboard.
  - **Permission group**: Who can see the item.
  - **Visualisation type**: Pick from pie, line, bar, single value, tables, etc.
- Select **Create** to enter the main builder workspace.

## 3. Describe the data you want to show
- The left-hand panel is a step-by-step “Data transform” area. Drag items from the data library to build your pipeline, or switch to **Data transform JSON** if you prefer to edit the raw configuration.
- Each transform block describes how the dashboard item pulls or reshapes data (for example, fetching survey responses, filtering rows, or calculating totals). Reorder blocks to control the flow.
- If you do not see a transform you need, this is currently not possible through the application interface.

## 4. Choose data to preview with
- Above the chart area, select a **Project**, **Location**, and **Date range** that match the audience you are designing for. These fields decide which real data the preview will request.
- If you have a sample data file instead, click **or upload data** to load a `.json` file. You can remove the file later to switch back to live data.

## 5. Preview the dashboard item
- Press the blue **Play** button in the data panel whenever you want to refresh the preview.
- Use the **Data Preview** tab to confirm the rows and columns look right, then switch to **Chart Preview** to see how the item will render.
- In Chart Preview you can:
  - Toggle **Chart presentation JSON** to directly edit the chart config.
  - Keep JSON mode off and use the visual fields or the Presentation Assistant to adjust colours, series, and labels.
  - Scroll through any validation errors shown beside the editor; fix them before saving.

## 6. Save, edit, or export
- The toolbar at the top always shows the project, permission group, and chart name you are working on.
- Use **Edit** to reopen the metadata form (name, code, permission group, visualisation type) without leaving the page.
- Click **Save** to create or update the visualisation. You can stay on the page or jump back to the Admin Panel once saving succeeds.
- The download icon exports the current visualisation as a JSON file so you can keep a backup or share it with teammates.

## 7. Place the item on a dashboard
- Saving a visualisation does not automatically show it to end users. Back in **Visualisations → Dashboard relations**, create a relation that links your new dashboard item to a dashboard code, the entity types (e.g. country, facility), the permission groups, the target projects, and an optional sort order.
- If you also need a brand new dashboard tab, add it under **Visualisations → Dashboards** before creating the relation. Set the dashboard’s code, name, and root entity (the top-level location that owns the dashboard).
- Once the relation is saved, the dashboard item appears on Tupaia for anyone whose location and permissions match what you entered.

## 8. When the interface is not enough
- Creating new permission groups, new transform types, or new data tables requires developer support. This is currently not possible through the application interface.
- If your data source lives outside the datasets already exposed in the data library, contact the Tupaia support team so they can add it to the platform.
