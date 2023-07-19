import MainLayout from '../layouts/MainLayout';
import React from 'react';
// User Guide Images
import UserGuideConsole from '../assets/images/UserGuideConsole.png';
import UserGuideDashboard from '../assets/images/UserGuideDashboard.png';
import UserGuideDataSearch_1 from '../assets/images/UserGuideDataSearch_1.png';
import UserGuideDataSearch_2 from '../assets/images/UserGuideDataSearch_2.png';
import UserGuideDataSearch_3 from '../assets/images/UserGuideDataSearch_3.png';
import UserGuideDataSearch_4 from '../assets/images/UserGuideDataSearch_4.png';
import UserGuideDataSearch_5 from '../assets/images/UserGuideDataSearch_5.png';
import UserGuideDataSearch_6 from '../assets/images/UserGuideDataSearch_6.png';
import UserGuideDataSearch_7 from '../assets/images/UserGuideDataSearch_7.png';
import UserGuideDataSearch_8 from '../assets/images/UserGuideDataSearch_8.png';
import UserGuideDataVisualization_1 from '../assets/images/UserGuideDataVisualization_1.png';
import UserGuideDataVisualization_2 from '../assets/images/UserGuideDataVisualization_2.png';
import UserGuideDataVisualization_3 from '../assets/images/UserGuideDataVisualization_3.png';
import UserGuideDataVisualization_4 from '../assets/images/UserGuideDataVisualization_4.png';

import UserGuideHistory from '../assets/images/UserGuideHistory.png';
import UserGuideLogin from '../assets/images/UserGuideLogin.png';
import UserGuideMapVisualization from '../assets/images/UserGuideMapVisualization.png';
import UserGuideNotification from '../assets/images/UserGuideNotification.png';
import UserGuideRegister from '../assets/images/UserGuideRegister.png';
import UserGuideAccountTab from '../assets/images/UserGuideAccountTab.png';
import UserGuideAccount from '../assets/images/UserGuideAccount.png';
import UserGuideUC1_1 from '../assets/images/UserGuideUC1_1.png';
import UserGuideUC1_2 from '../assets/images/UserGuideUC1_2.png';
import UserGuideUC1_3 from '../assets/images/UserGuideUC1_3.png';
import UserGuideUC1_4 from '../assets/images/UserGuideUC1_4.png';
import UserGuideUC2_a_1 from '../assets/images/UserGuideUC2-a_1.png';
import UserGuideUC2_a_2 from '../assets/images/UserGuideUC2-a_2.png';
import UserGuideUC2_b_1 from '../assets/images/UserGuideUC2-b_1.png';
import UserGuideUC2_b_2 from '../assets/images/UserGuideUC2-b_2.png';
import UserGuideUC2_b_3 from '../assets/images/UserGuideUC2-b_3.png';
import UserGuideUC2_b_4 from '../assets/images/UserGuideUC2-b_4.png';
import UserGuideUC2_b_5 from '../assets/images/UserGuideUC2-b_5.png';
import UserGuideUC2_b_6 from '../assets/images/UserGuideUC2-b_6.png';
import UserGuideUC2_b_7 from '../assets/images/UserGuideUC2-b_7.png';
import UserGuideUC3_1 from '../assets/images/UserGuideUC3_1.png';
import UserGuideUC3_2 from '../assets/images/UserGuideUC3_2.png';
import UserGuideUC3_3 from '../assets/images/UserGuideUC3_3.png';
import UserGuideUC3_4 from '../assets/images/UserGuideUC3_4.png';
import UserGuideUC4_1 from '../assets/images/UserGuideUC4_1.png';
import UserGuideUC4_2 from '../assets/images/UserGuideUC4_2.png';
import UserGuideUC4_3 from '../assets/images/UserGuideUC4_3.png';
import UserGuideUC4_4 from '../assets/images/UserGuideUC4_4.png';
import UserGuideUC4_5 from '../assets/images/UserGuideUC4_5.png';
import UserGuideUC4_6 from '../assets/images/UserGuideUC4_6.png';
import UserGuideUC5_1 from '../assets/images/UserGuideUC5_1.png';
import UserGuideUC5_2 from '../assets/images/UserGuideUC5_2.png';
import UserGuideUC5_3 from '../assets/images/UserGuideUC5_3.png';
import UserGuideUC5_4 from '../assets/images/UserGuideUC5_4.png';
import UserGuideUC5_5 from '../assets/images/UserGuideUC5_5.png';
import UserGuideUC5_6 from '../assets/images/UserGuideUC5_6.png';
import UserGuideUC5_7 from '../assets/images/UserGuideUC5_7.png';
import UserGuideUC5_8 from '../assets/images/UserGuideUC5_8.png';
import UserGuideUC5_9 from '../assets/images/UserGuideUC5_9.png';
import UserGuideUC5_10 from '../assets/images/UserGuideUC5_10.png';
import UserGuideUC5_11 from '../assets/images/UserGuideUC5_11.png';
import UserGuideUC6_1 from '../assets/images/UserGuideUC6_1.png';
import UserGuideUC6_2 from '../assets/images/UserGuideUC6_2.png';
import UserGuideUC6_3 from '../assets/images/UserGuideUC6_3.png';
import UserGuideUC6_4 from '../assets/images/UserGuideUC6_4.png';
import UserGuideUC6_5 from '../assets/images/UserGuideUC6_5.png';
import UserGuideUC6_6 from '../assets/images/UserGuideUC6_6.png';
import UserGuideUC6_7 from '../assets/images/UserGuideUC6_7.png';
import UserGuideUC7_1 from '../assets/images/UserGuideUC7_1.png';
import UserGuideUC7_2 from '../assets/images/UserGuideUC7_2.png';
import UserGuideUC7_3 from '../assets/images/UserGuideUC7_3.png';
import UserGuideUC7_4 from '../assets/images/UserGuideUC7_4.png';
import UserGuideWorkflowCreator from '../assets/images/UserGuideWorkflowCreator.png';
import UserGuideWorkflowEditor_1 from '../assets/images/UserGuideWorkflowEditor_1.png';
import UserGuideWorkflowEditor_2 from '../assets/images/UserGuideWorkflowEditor_2.png';
import UserGuideWorkflowEditor_3 from '../assets/images/UserGuideWorkflowEditor_3.png';
import UserGuideWorkflowEditor_4 from '../assets/images/UserGuideWorkflowEditor_4.png';
import UserGuideWorkflowEditor_5 from '../assets/images/UserGuideWorkflowEditor_5.png';
import UserGuideWorkflowEditor_6 from '../assets/images/UserGuideWorkflowEditor_6.png';
import UserGuideWorkflowEditor_7 from '../assets/images/UserGuideWorkflowEditor_7.png';
import UserGuideWorkflowEditor_8 from '../assets/images/UserGuideWorkflowEditor_8.png';
import UserGuideWorkflowEditor_9 from '../assets/images/UserGuideWorkflowEditor_9.png';
import UserGuideXRVR_1 from '../assets/images/UserGuideXRVR_1.png';
import UserGuideXRVR_2 from '../assets/images/UserGuideXRVR_2.png';
import UserGuideXRVR_3 from '../assets/images/UserGuideXRVR_3.png';
import UserGuideFileExplorer from '../assets/images/UserGuideFileExplorer.png';

import { Collapse, Row, Col, Image } from 'antd';

const { Panel } = Collapse;

// Helper function to render images in a responsive grid with improved styling
const renderImages = (images) => (
  <Row gutter={[16, 16]} justify='left' style={{ marginBottom: '16px' }}>
    {images.map((src, index) => (
      <Col key={index} xs={24} sm={12} md={8} lg={6}>
        <Image
          src={src}
          alt={`User Guide ${index + 1}`}
          style={{
            width: '100%',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
          preview={true}
        />
      </Col>
    ))}
  </Row>
);

export default function UserGuide() {
  return (
    <MainLayout menu='19'>
      <div style={{ padding: '20px' }}>
        <Collapse accordion>
          <Panel header='General Flow Description' key='1'>
            <p>
              The EO4EU platform enables users to access, process, and analyse Earth observation data by integrating
              various data sources, automating workflows, and providing advanced visualisation tools. It supports data
              discovery, workflow creation, fusion algorithms, and machine learning applications to extract meaningful
              insights from geospatial data.
            </p>
            <h3>Steps to Use the EO4EU Platform:</h3>
            <ol>
              <li>
                <strong>Register and Log In</strong>
                <br />
                Create an account and log in to access your profile, manage applications, and configure settings (see
                Account).
              </li>
              <li>
                <strong>Search for Data</strong>
                <br />
                Use the Data Search tool to find relevant datasets by selecting a data source, applying filters such as
                area of interest and date range, and retrieving the necessary data.
              </li>
              <li>
                <strong>Create a Workflow</strong>
                <br />
                In the Workflow Creator, define a new workflow by selecting datasets and structuring the workflow. You
                can also upload in situ data if needed.
              </li>
              <li>
                <strong>Edit the Workflow</strong>
                <br />
                Open the Workflow Editor to design and configure your workflow by dragging and dropping components,
                setting parameters, and applying processing techniques (see Fusion Functions).
              </li>
              <li>
                <strong>Execute and Monitor Workflow</strong>
                <br />
                Save and publish the workflow to start processing. Track progress through the platform’s status
                indicators and notification system.
              </li>
              <li>
                <strong>Visualize and Analyse Data</strong>
                <br />
                Explore processed results using Data Visualization for graphs, Map Visualization for geospatial
                overlays, and XR/VR Visualization for 3D analysis.
              </li>
              <li>
                <strong>Manage Files and Track History</strong>
                <br />
                Access workflow outputs in the File Explorer, execute advanced commands in the Console, and review past
                workflows in the History section for tracking and iteration.
              </li>
            </ol>
          </Panel>
          <Panel header='Authentication & Account Management' key='2'>
            <p>
              To access the EO4EU platform, the user must register to the platform. Once you access the Web Portal for
              the first time, you will see the sign-in screen.
            </p>
            {renderImages([UserGuideLogin])}
            <p>As you can see, there is a register button that you can press to register yourself as a new user.</p>
            {renderImages([UserGuideRegister])}
            <p>
              Once you have registered and you can access the Web Portal, there is a section "Account" on the left menu
            </p>
            {renderImages([UserGuideAccountTab])}
            <p>Which allows you to see/edit your personal details and see the applications that you have access to.</p>
            {renderImages([UserGuideAccount])}
          </Panel>
          <Panel header='Dashboard' key='3'>
            <p>The dashboard provides an overview of your data and workflows.</p>
            {renderImages([UserGuideDashboard])}
          </Panel>
          <Panel header='Data Search' key='4'>
            <p>
              The first step in using the EO4EU platform is to search for the data needed. One of the platform's main
              contributions is that it allows semantic data search through various data sources, including the option to
              upload datasets. Once the user logs in to the portal, the first accordion section is entitled "Dataset
              Search", which is the tool used to search through data sources semantically.
            </p>
            <p>From the drop-down menu, the user can choose the data source and provide a keyword.</p>
            {renderImages([UserGuideDataSearch_1])}
            <p>
              Once the data source and keyword are defined, the user can search using the search button on the top right
              and the most matching results will be shown.
            </p>
            {renderImages([UserGuideDataSearch_2])}
            <p>
              Once the user chooses the dataset of interest, a specialised menu provides more details/options. The
              example for the ADAM data source includes a description of the dataset, its variables, file formats, and
              data types.
            </p>
            {renderImages([UserGuideDataSearch_3])}
            <p>
              Additionally, another section of this menu is the ADAM Advanced Filter where the user can choose the area
              of interest on the map.
            </p>
            {renderImages([UserGuideDataSearch_4])}

            <p>Once the area is defined, the user can choose the date ranges.</p>
            {renderImages([UserGuideDataSearch_5])}

            <p>
              Once the date range is defined you can filter them to identify the correct products to download and select
              the button “Filter now”.
            </p>
            {renderImages([UserGuideDataSearch_6])}

            <p>
              When the products are chosen, the user can choose whether the EO4EU visualisation tool should be used.
              Then, the user uses the Generate Script button to create the Python Script and the Meta Info JSON that
              will be passed to the Workflow Editor Component.
            </p>
            {renderImages([UserGuideDataSearch_7])}

            <p>
              The user as a final step shall select the button “Save WF product”. The next thing is the Workflow
              Creator.
            </p>
            {renderImages([UserGuideDataSearch_8])}
          </Panel>
          <Panel header='Workflow Creator' key='5'>
            <p>
              Workflow creator is the common space where a user can have an overview of all the saved workflow products
              in their account. In this section a user shall type a workflow name in the respective field.
            </p>
            <p>
              Afterwards the user shall either select some workflow products to be used in this workflow or can select
              none in order to create an empty workflow. An empty workflow can be used in order to upload in the next
              step a user its own data, i.e. in situ. The user, after selecting the preferred workflow products, if
              needed, and adds a name, can press the create workflow button to create the workflow in the workflow
              editor.
            </p>
            {renderImages([UserGuideWorkflowCreator])}
            <p>
              For the specific use case we named our use case as “test-case”, we selected 2 workflow products, and we
              selected the “Create workflow” button.
            </p>
            <p>
              A user can check if the workflow has created correctly by the notification area and the message success in
              the left part of the platform.
            </p>
            {renderImages([UserGuideNotification])}
            <p>
              The next step is for the user to create a chain of actions in the Workflow Editor for the specific data
              input.
            </p>
          </Panel>
          <Panel header='Workflow Editor' key='6'>
            <p>
              WFE is a component of the EO4EU platform that a user can manage (publish, delete and save as draft) a
              workflow.
            </p>
            <p>
              In the application, there are two basic views. The view that the user can see and manage all the workflows
              that have been created, as well as their status and the editing view named as Workflows List.
            </p>
            {renderImages([UserGuideWorkflowEditor_1])}
            <p>The status of each workflow is visible in each workflow item. All possible statuses are:</p>
            <ul>
              <li>draft</li>
              <li>compiling</li>
              <li>compiled</li>
              <li>publishing</li>
              <li>published</li>
              <li>stopping</li>
              <li>stopped</li>
              <li>error</li>
            </ul>
            <p>
              With the 3-dots menu in the top right corner of the item, a user can see publish, view or delete an item
              depending on the state of this.
            </p>
            {renderImages([UserGuideWorkflowEditor_2, UserGuideWorkflowEditor_3])}
            <p>If a user selects view, the workflow editor builder opens.</p>
            <p>
              The editor is divided into three main sections. The top bar where the user can save his work or publish
              it. The editing canvas and the marketplace of the components available, on the left, for insertion into
              the workflow.
            </p>
            <p>Items in the marketplace are searchable.</p>
            <p>
              A workflow building process is by drag-and-drop items from the marketplace to the canvas and connecting
              them.
            </p>
            {renderImages([UserGuideWorkflowEditor_4])}
            <p>
              Editable items have a 3-dot menu. Clicking on it opens a new window in which the user can edit the
              parameters of each component.
            </p>
            {renderImages([UserGuideWorkflowEditor_5])}
            <h4>Fusion Functions</h4>
            <p>
              Fusion Algorithms can be selected in Workflow Editor. In v1 a user can select 6 fusion algorithms and can
              be combined in a more complicated workflow.
            </p>
            <ul>
              <li>
                Normalized difference vegetation index (NDVI):
                <ul>
                  <li>The algorithm calculates the normalized difference vegetation index as</li>
                  <li>
                    The result has values between -1 and 1. The user selects the NIR and RED bands (at the moment only
                    Sentinel-2 products) that will be used as inputs for the calculation. This step will add the
                    calculated band to the current list of bands.
                  </li>
                </ul>
              </li>
              <li>
                Merge Bands S2
                <ul>
                  <li>This algorithm merges selected Sentinel-2 bands to create a new composite product.</li>
                </ul>
              </li>
              <li>
                Merge Rasters
                <ul>
                  <li>This algorithm merges raster layers from multiple sources into a single raster layer.</li>
                </ul>
              </li>
              <li>
                Hours to Days (ERA5)
                <ul>
                  <li>This algorithm converts hourly data from ERA5 into daily data.</li>
                </ul>
              </li>
              <li>
                Kernel Density Estimation
                <ul>
                  <li>
                    A spatial analyst tool that calculates the density of features in a neighborhood around those
                    features.
                  </li>
                </ul>
              </li>
            </ul>
            <h4>ML Models</h4>
            <p>In this section, there are predefined ML models available.</p>
            <ul>
              <li>
                [UC5] Soil-Erosion (C-factor prediction)
                <ul>
                  <li>ML model that uses EO data to predict C-factor for soil erosion.</li>
                </ul>
              </li>
              <li>
                [UC6] Food (Locust)
                <ul>
                  <li>ML model that uses EO data to predict locust outbreaks.</li>
                </ul>
              </li>
            </ul>
            <p>In the data source, users can upload new files and manage their files and directories.</p>
            {renderImages([UserGuideWorkflowEditor_6, UserGuideWorkflowEditor_7])}
            <p>
              When the chain of the actions are completed then the user can either save the workflow or publish the
              workflow, which is translated to start the workflow.
            </p>
            {renderImages([UserGuideWorkflowEditor_8])}
            <p>
              Finally, if the user wants to go back to the first screen of the WFE, the user should press on the EO4EU
              logo at the top left.
            </p>
            <p>
              Once the workflow is started, the progress of the workflow can be found in the notifications section of
              the EO4EU portal.
            </p>
            {renderImages([UserGuideWorkflowEditor_9])}
          </Panel>
          <Panel header='The Results of the Workflow' key='7'>
            <p>
              Once the workflow processing has been completed, whether raw or processed data, the output files can be
              visualised in three ways. If the results are geotiffs, they can be visualised on maps by overlaying layers
              in 2D through the "Map Visualisation" component. The results can be visualised on graphs or tables through
              the "Data Visualisation" component if the results are arithmetic data. Finally, the platform provides the
              option to visualise the data in a 3D mode through the XR/VR component. More details on the three
              components can be found in the following subsections. The files can also be accessible in the File
              Explorer section.
            </p>
            <Collapse accordion>
              <Panel header='Data Visualization' key='7.1'>
                <p>
                  The Data Visualization tool provides various charts and graphs to help users understand and analyse
                  their data. Users can customise their visualisations and save them for future reference. The users can
                  choose their workflow of interest from the dropdown list and generate charts using the Add Chart
                  button.
                </p>
                {renderImages([UserGuideDataVisualization_1])}
                <p>
                  When the users press on the Add Chart button, the below menu appears to choose the file to visualise.
                </p>
                {renderImages([UserGuideDataVisualization_2])}
                <p>Once the file is chosen, another menu appears to configure what the chart will present.</p>
                {renderImages([UserGuideDataVisualization_3])}
                <p>
                  When all the configurations are provided, the user will press on Create Chart and the chart will be
                  created. The user can create as many chart as needed with either 1 or 2 charts per row.
                </p>
                {renderImages([UserGuideDataVisualization_4])}
              </Panel>
              <Panel header='Map Visualization' key='7.2'>
                <p>
                  The Map Visualization tool allows users to visualise geospatial data on a map. Users can overlay
                  different datasets and use various spatial data analysis tools. The user can choose the Workflow with
                  available data from the Workflow dropdown menu and select the file (or multiple files) they want to
                  visualise. The tool can visualise tiff, NetCDF and shapefiles.
                </p>
                {renderImages([UserGuideMapVisualization])}
              </Panel>
              <Panel header='XR/VR' key='7.3'>
                <p>
                  This tool allows the user to explore the output data and the intermediate results of a specific
                  workflow in an Extended Reality (XR) environment, namely Virtual Reality (VR) environment and
                  Augmented Reality (AR) environment. Currently it is available on the dashboard only the possibility to
                  visualize the data in a Virtual Reality environment. To enable the XR visualization on a specific
                  workflow, during its creation within the Workflow Editor application, the AR/XR task needs to be
                  linked to the data output task as shown in the following image:
                </p>
                {renderImages([UserGuideXRVR_1])}
                <p>
                  When a specific workflow is selected using select workflow section in the dashboard, if the XR
                  visualization was enabled during the creation phase of the workflow, the VR visualization of its
                  resulting data is available opening the XR/VR tab in the dashboard Home section. In the VR interface
                  home page, all the areas covered by the data resulting from the selected workflow are displayed as
                  selectable bounding boxes on a globe. If a device supporting VR sessions is detected, a button appears
                  on the top-right corner of the application and can be used to start a VR session.
                </p>
                {renderImages([UserGuideXRVR_2])}
                <p>
                  Selecting a specific bounding box, it is possible to visualize the data related to the selected area
                  jointly with a basic set of metadata. During a VR session a wrist mounted User Interface is available
                  to navigate between the different data layers and display the metadata information.
                </p>
                {renderImages([UserGuideXRVR_3])}
              </Panel>
              <Panel header='File Explorer' key='7.4'>
                <p>
                  The File Explorer allows the user to browse through uploaded and generated files. The File Explorer
                  contains a hierarchical directory structure that the user can navigate. In order to visualize the
                  files in the bucket of the workflow a user shall select the name of the relevant workflow.
                </p>
                {renderImages([UserGuideFileExplorer])}
              </Panel>
            </Collapse>
          </Panel>
          <Panel header='Console and History' key='8'>
            <p>At the left part of the GUI you can also overview the Console and the history tabs.</p>
            <Collapse>
              <Panel header='Console' key='8.1'>
                <p>
                  The Console provides a command-line interface for advanced users to interact with the EO4EU platform.
                  Users can execute scripts and commands directly from the console.
                </p>
                {renderImages([UserGuideConsole])}
              </Panel>
              <Panel header='History' key='8.2'>
                <p>
                  The User History section keeps track of all user activities and workflows. Users can view their
                  history to review past actions and results.
                </p>
                {renderImages([UserGuideHistory])}
              </Panel>
            </Collapse>
          </Panel>
          <Panel header='Use Case Tutorials' key='9'>
            <p>
              We are providing the steps to run all the use cases in the EO4EU platform. All the in-situ files can be
              found in the following link:
              <a
                href='https://drive.google.com/drive/folders/1Fb2LOyWKU55NvkBFc9iWuMQ7ev0Hoio0?usp=sharing'
                target='_blank'
                rel='noopener noreferrer'
              >
                Google Drive
              </a>
            </p>
            <Collapse>
              <Panel header='User Case 1' key='9.1'>
                <p>This use case will run with in situ data. The original data are created through an API of Pasyfo.</p>
                <ol>
                  <li>Create an empty workflow. In the example with the name UC1.</li>
                  {renderImages([UserGuideUC1_1])}
                  <li>Open Workflow editor and find the draft workflow with the name of UC1.</li>
                  <li>We add the following components and connect them as described below.</li>
                  {renderImages([UserGuideUC1_2])}
                  <li>We select data source in order to upload the uc1.zip as in situ data.</li>
                  {renderImages([UserGuideUC1_3])}
                  <li>Save the workflow.</li>
                  <li>Publish the workflow.</li>
                  <li>When the workflow ends a NetCDF is published.</li>
                  {renderImages([UserGuideUC1_4])}
                </ol>
              </Panel>
              <Panel header='User Case 2-a' key='9.2.1'>
                <p>This use case will run with in situ data.</p>
                <ol>
                  <li>Create an empty workflow.</li>
                  {renderImages([UserGuideUC2_a_1])}
                  <li>Open Workflow editor and find the draft workflow with the name of uc2-a.</li>
                  <li>We add the following components and connect them as described below.</li>
                  {renderImages([UserGuideUC2_a_2])}
                  <li>We select data source in order to upload the uc2(1.csv).zip as in situ data.</li>
                  <li>Save the workflow.</li>
                  <li>Publish the workflow.</li>
                  <li>When the workflow ends Numpy Array and CSV are published for computing the Fuel Consumption.</li>
                </ol>
              </Panel>
              <Panel header='User Case 2-b' key='9.2.2'>
                <p>Data search:</p>
                <ol>
                  <li>Sentinel-3 OLCI Level 1B- (04/01/2024 - 10/01/2024) close to the area of Suez.</li>
                  <li>Select Source: Sentinel - Data search: Sentinel-3 OLCI Level 1B.</li>
                  <li>Choose the following data source: Sentinel-3 OLCI Level 1B.</li>
                  {renderImages([UserGuideUC2_b_1])}
                  <li>Define area of interest.</li>
                  {renderImages([UserGuideUC2_b_2])}
                  <li>Define Date range (04/01/2024-10/01/2024).</li>
                  {renderImages([UserGuideUC2_b_3])}
                  <li>Generate Script and Save WF product.</li>
                  {renderImages([UserGuideUC2_b_4])}
                  <li>
                    Workflow Creator: Create a workflow named uc2-b with the product Sentinel-3 OLCI Level 1B selected.
                  </li>
                  {renderImages([UserGuideUC2_b_5])}
                  <li>
                    Open Workflow editor and find the draft workflow with the name of uc2-b. In the menu on the top
                    right corner click view.
                  </li>
                  {renderImages([UserGuideUC2_b_6])}
                  <li>Add the following components and connect them as described below.</li>
                  {renderImages([UserGuideUC2_b_7])}
                  <li>Save the workflow.</li>
                  <li>Publish the workflow.</li>
                  <li>When the workflow ends a Numpy Array and a CSV are published to identify the wind prediction.</li>
                </ol>
              </Panel>
              <Panel header='User Case 3' key='9.3'>
                <p>This use case will run with in situ data.</p>
                <ol>
                  <li>Create an empty workflow with name uc3.</li>
                  {renderImages([UserGuideUC3_1])}
                  <li>Open Workflow editor and find the draft workflow with the name of uc3. Click view.</li>
                  {renderImages([UserGuideUC3_2])}
                  <li>We add the following components and connect them as described below.</li>
                  {renderImages([UserGuideUC3_3])}
                  <li>We select data source in order to upload the UC3_INSITU.zip) as in situ data.</li>
                  {renderImages([UserGuideUC3_4])}
                  <li>Save the workflow.</li>
                  <li>Publish the workflow.</li>
                  <li>When the workflow ends a numpy array and a csv are published.</li>
                </ol>
              </Panel>
              <Panel header='User Case 4' key='9.4'>
                <p>Hint: UC4 is for forest recognition so we need at least an area of land.</p>
                <p>Data search:</p>
                <ol>
                  <li>Sentinel-1 GRD - (04/01/2024 - 10/01/2024) close to the area of Suez.</li>
                  <li>Select Source: Adam or Sentinel - Data search: Sentinel-1 GRD.</li>
                  {renderImages([UserGuideUC4_1])}
                  <li>Choose the following data source: Sentinel-1 GRD.</li>
                  <li>Define area of interest.</li>
                  {renderImages([UserGuideUC4_2])}
                  <li>Define Date range (04/01/2024-10/01/2024).</li>
                  {renderImages([UserGuideUC4_3])}
                  <li>Generate Script and Save WF product.</li>
                  <li>Workflow Creator: Create a workflow named uc4 with the product Sentinel-1 GRD selected.</li>
                  {renderImages([UserGuideUC4_4])}
                  <li>Open Workflow editor and find the draft workflow with the name of uc4. Click view.</li>
                  <li>Add the following components and connect them as described below.</li>
                  {renderImages([UserGuideUC4_5])}
                  <li>Save the workflow.</li>
                  <li>Publish the workflow.</li>
                  <li>
                    When the workflow ends tiffs of the prediction of a specific area identified as forest are
                    published.
                  </li>
                  {renderImages([UserGuideUC4_6])}
                </ol>
              </Panel>
              <Panel header='User Case 5' key='9.5'>
                <p>Data search:</p>
                <ol>
                  <li>Sentinel-2 Bands 2,3,4 (04/01/2024 - 05/01/2024). For each dataset</li>
                  <li>Define area of interest – like Sicily.</li>
                  <li>Define Date range (04/01/2024 - 05/01/2024).</li>
                  <li>Push Filter now, select all products, Generate and Save workflow.</li>
                  {renderImages([UserGuideUC5_1])}
                  {renderImages([UserGuideUC5_2])}
                  {renderImages([UserGuideUC5_3])}
                  {renderImages([UserGuideUC5_4])}
                  {renderImages([UserGuideUC5_5])}
                  <li>
                    In the workflow creator, we select the two datasets and we name the workflow UC5-test and we select
                    Create Workflow.
                  </li>
                  {renderImages([UserGuideUC5_6])}
                  <li>
                    In the Workflow editor, we are using the components as shown in the picture below, we save and
                    publish the workflow.
                  </li>
                  {renderImages([UserGuideUC5_7])}
                  {renderImages([UserGuideUC5_8])}
                  {renderImages([UserGuideUC5_9])}
                  <li>When the workflow ends tiffs are published.</li>
                  {renderImages([UserGuideUC5_10])}
                  {renderImages([UserGuideUC5_11])}
                </ol>
              </Panel>
              <Panel header='User Case 6' key='9.6'>
                <p>Data search:</p>
                <ol>
                  <li>ERA5 Land: 2m temperature (hourly) (04/01/2024 - 10/01/2024) close to the area of Suez.</li>
                  <li>Data search ERA5 Land: 2m temperature (hourly).</li>
                  <li>Define area of interest.</li>
                  {renderImages([UserGuideUC6_1])}
                  <li>Define Date range (04/01/2024-10/01/2024).</li>
                  {renderImages([UserGuideUC6_2])}
                  <li>Push Filter now, select all products, Generate and Save workflow.</li>
                  <li>Data Source ERA5 land: total precipitation (hourly).</li>
                  <li>
                    Define area. In the right part above the map, a user can select the last bounded box selected in the
                    previous search.
                  </li>
                  {renderImages([UserGuideUC6_3])}
                  <li>Define the Date range (04/01/2024-10/01/2024) and Filter now.</li>
                  {renderImages([UserGuideUC6_4])}
                  <li>Select all, True and Generate Script.</li>
                  <li>Save workflow.</li>
                  {renderImages([UserGuideUC6_5])}
                  <li>
                    In the workflow creator, we select the two datasets and we name the workflow uc1_11_01 and we select
                    Create Workflow.
                  </li>
                  {renderImages([UserGuideUC6_6])}
                  <li>
                    In the Workflow editor, we are using the components as shown in the picture below, we save and
                    publish the workflow.
                  </li>
                  {renderImages([UserGuideUC6_7])}
                </ol>
              </Panel>
              <Panel header='User Case 7' key='9.7'>
                <p>This use case will run with in situ data.</p>
                <p>Data search:</p>
                <ol>
                  <li>Create an empty workflow as in UC1 or UC2.</li>
                  {renderImages([UserGuideUC7_1])}
                  <li>Open Workflow editor and find the draft workflow with the name of uc7.</li>
                  <li>We add the following components and connect them as described below.</li>
                  {renderImages([UserGuideUC7_2])}
                  <li>We select data source in order to upload the uc7.zip as in situ data.</li>
                  <li>Save the workflow.</li>
                  <li>Publish the workflow.</li>
                  <li>When the workflow ends a tiff is published going to zixel app.</li>
                  {renderImages([UserGuideUC7_3])}
                  {renderImages([UserGuideUC7_4])}
                </ol>
              </Panel>
            </Collapse>
          </Panel>
        </Collapse>
      </div>
    </MainLayout>
  );
}
