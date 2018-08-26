import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import uuid from "uuid/v4";
import { Input as ButtercupInput, Button as ButtercupButton } from "@buttercup/ui";
import Spinner from "react-spinkit";
import LayoutMain from "./LayoutMain.js";
import ArchiveTypeChooser from "../containers/ArchiveTypeChooser.js";
import RemoteExplorer from "../containers/RemoteExplorer.js";
import MyButtercupArchiveChooser from "../containers/MyButtercupArchiveChooser.js";
import { FormButtonContainer, FormContainer, FormLegendItem, FormRow, FormInputItem } from "./forms.js";

const SubSection = styled.div`
    width: 100%;
    margin-top: 30px;
`;
const LoaderContainer = styled.div`
    width: 100%;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
`;
const Spacer = styled.div`
    width: 100%;
    height: 30px;
`;

class AddArchivePage extends Component {
    static propTypes = {
        dropboxAuthID: PropTypes.string,
        dropboxAuthToken: PropTypes.string,
        isConnected: PropTypes.bool.isRequired,
        isConnecting: PropTypes.bool.isRequired,
        onAuthenticateDropbox: PropTypes.func.isRequired,
        onAuthenticateMyButtercup: PropTypes.func.isRequired,
        onChooseDropboxBasedArchive: PropTypes.func.isRequired,
        onChooseWebDAVBasedArchive: PropTypes.func.isRequired,
        onConnectWebDAVBasedSource: PropTypes.func.isRequired,
        onCreateRemotePath: PropTypes.func.isRequired,
        onSelectRemotePath: PropTypes.func.isRequired,
        selectedArchiveType: PropTypes.string,
        selectedFilename: PropTypes.string,
        selectedFilenameNeedsCreation: PropTypes.bool.isRequired,
        selectedMyButtercupArchives: PropTypes.arrayOf(PropTypes.number).isRequired
    };

    // We store some details in the state, because they're sensitive. No point
    // storing them globally..
    state = {
        archiveName: "",
        dropboxAuthenticationID: "",
        masterPassword: "",
        remoteURL: "",
        remoteUsername: "",
        remotePassword: ""
    };

    componentDidMount() {
        this.setState({
            dropboxAuthenticationID: uuid(),
            myButtercupAuthenticationID: uuid()
        });
    }

    handleDropboxAuth(event) {
        event.preventDefault();
        this.props.onAuthenticateDropbox(this.state.dropboxAuthenticationID);
    }

    handleChooseDropboxBasedFile(event) {
        event.preventDefault();
        // We send the remote credentials as these should never touch Redux
        this.props.onChooseDropboxBasedArchive(this.state.archiveName, this.state.masterPassword);
    }

    handleChooseMyButtercupBasedArchives(event) {
        event.preventDefault();
    }

    handleChooseWebDAVBasedFile(event) {
        event.preventDefault();
        // We send the remote credentials as these should never touch Redux
        this.props.onChooseWebDAVBasedArchive(
            this.props.selectedArchiveType,
            this.state.archiveName,
            this.state.masterPassword,
            this.state.remoteURL,
            this.state.remoteUsername,
            this.state.remotePassword
        );
    }

    handleConnectNextcloud(event) {
        event.preventDefault();
        this.props.onConnectWebDAVBasedSource(
            "nextcloud",
            this.state.remoteURL,
            this.state.remoteUsername,
            this.state.remotePassword
        );
    }

    handleConnectOwnCloud(event) {
        event.preventDefault();
        this.props.onConnectWebDAVBasedSource(
            "owncloud",
            this.state.remoteURL,
            this.state.remoteUsername,
            this.state.remotePassword
        );
    }

    handleConnectWebDAV(event) {
        event.preventDefault();
        this.props.onConnectWebDAVBasedSource(
            "webdav",
            this.state.remoteURL,
            this.state.remoteUsername,
            this.state.remotePassword
        );
    }

    handleMyButtercupAuth(event) {
        event.preventDefault();
        this.props.onAuthenticateMyButtercup(this.state.myButtercupAuthenticationID);
    }

    handleUpdateForm(property, event) {
        this.setState({
            [property]: event.target.value
        });
    }

    render() {
        const canShowWebDAVExplorer = ["webdav", "owncloud", "nextcloud"].includes(this.props.selectedArchiveType);
        const isTargetingDropbox = this.props.selectedArchiveType === "dropbox";
        const isTargetingMyButtercup = this.props.selectedArchiveType === "mybuttercup";
        const hasAuthenticatedDropbox =
            this.props.dropboxAuthID === this.state.dropboxAuthenticationID && this.props.dropboxAuthToken;
        const hasAuthenticatedMyButtercup =
            this.props.myButtercupAuthID === this.state.myButtercupAuthenticationID && this.props.myButtercupAuthToken;
        return (
            <LayoutMain title="Add Archive">
                <h3>Choose Archive Type</h3>
                <ArchiveTypeChooser disabled={this.props.isConnecting || this.props.isConnected} />
                <If condition={this.props.selectedArchiveType}>{this.renderConnectionInfo()}</If>
                <If condition={this.props.isConnecting}>
                    <LoaderContainer>
                        <Spinner color="rgba(0, 183, 172, 1)" name="ball-grid-pulse" />
                    </LoaderContainer>
                </If>
                <If condition={canShowWebDAVExplorer && this.props.isConnected}>
                    <h3>Choose or Create Archive</h3>
                    <RemoteExplorer
                        onCreateRemotePath={path => this.props.onCreateRemotePath(path)}
                        onSelectRemotePath={path => this.props.onSelectRemotePath(path)}
                        selectedFilename={this.props.selectedFilename}
                        selectedFilenameNeedsCreation={this.props.selectedFilenameNeedsCreation}
                        fetchType="webdav"
                    />
                    <If condition={this.props.selectedFilename}>{this.renderArchiveNameInput()}</If>
                </If>
                <If condition={isTargetingDropbox && hasAuthenticatedDropbox}>
                    <h3>Choose or Create Archive</h3>
                    <RemoteExplorer
                        onCreateRemotePath={path => this.props.onCreateRemotePath(path)}
                        onSelectRemotePath={path => this.props.onSelectRemotePath(path)}
                        selectedFilename={this.props.selectedFilename}
                        selectedFilenameNeedsCreation={this.props.selectedFilenameNeedsCreation}
                        fetchType="dropbox"
                    />
                    <If condition={this.props.selectedFilename}>{this.renderArchiveNameInput()}</If>
                </If>
                <If condition={isTargetingMyButtercup && hasAuthenticatedMyButtercup}>
                    <h3>Choose Archive(s)</h3>
                    <MyButtercupArchiveChooser />
                    <If condition={this.props.selectedMyButtercupArchives.length > 0}>
                        {this.renderArchiveNameInput()}
                    </If>
                </If>
            </LayoutMain>
        );
    }

    renderArchiveNameInput() {
        return (
            <SubSection key="archiveNameInput">
                <Choose>
                    <When condition={this.props.selectedArchiveType === "mybuttercup"}>
                        <h3>Enter Account Details</h3>
                    </When>
                    <Otherwise>
                        <h3>Enter Archive Details</h3>
                    </Otherwise>
                </Choose>
                <FormContainer>
                    <Choose>
                        <When condition={this.props.selectedArchiveType === "mybuttercup"}>
                            <FormRow>
                                <FormLegendItem>Master Password</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter account password..."
                                        onChange={event => this.handleUpdateForm("masterPassword", event)}
                                        type="password"
                                        value={this.state.masterPassword}
                                    />
                                </FormInputItem>
                            </FormRow>
                        </When>
                        <Otherwise>
                            <FormRow>
                                <FormLegendItem>Name</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter archive name..."
                                        onChange={event => this.handleUpdateForm("archiveName", event)}
                                        value={this.state.archiveName}
                                    />
                                </FormInputItem>
                            </FormRow>
                            <FormRow>
                                <FormLegendItem>Master Password</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter archive password..."
                                        onChange={event => this.handleUpdateForm("masterPassword", event)}
                                        type="password"
                                        value={this.state.masterPassword}
                                    />
                                </FormInputItem>
                            </FormRow>
                        </Otherwise>
                    </Choose>
                </FormContainer>
                <FormButtonContainer>
                    <Choose>
                        <When condition={this.props.selectedArchiveType === "dropbox"}>
                            <ButtercupButton onClick={event => this.handleChooseDropboxBasedFile(event)}>
                                Save Archive
                            </ButtercupButton>
                        </When>
                        <When condition={this.props.selectedArchiveType === "mybuttercup"}>
                            <ButtercupButton onClick={event => this.handleChooseMyButtercupBasedArchives(event)}>
                                Save Archive(s)
                            </ButtercupButton>
                        </When>
                        <Otherwise>
                            <ButtercupButton onClick={event => this.handleChooseWebDAVBasedFile(event)}>
                                Save Archive
                            </ButtercupButton>
                        </Otherwise>
                    </Choose>
                </FormButtonContainer>
                <Spacer />
            </SubSection>
        );
    }

    renderConnectionInfo() {
        const connectionOptionsDisabled = this.props.isConnecting || this.props.isConnected;
        const title = ["dropbox", "mybuttercup"].includes(this.props.selectedArchiveType)
            ? "Authenticate Cloud Source"
            : "Enter Connection Details";
        const isAuthenticatingDropbox = this.props.dropboxAuthID === this.state.dropboxAuthenticationID;
        const isAuthenticatingMyButtercup = this.props.myButtercupAuthID === this.state.myButtercupAuthenticationID;
        return (
            <SubSection>
                <h3>{title}</h3>
                <Choose>
                    <When condition={this.props.selectedArchiveType === "webdav"}>
                        <FormContainer>
                            <FormRow>
                                <FormLegendItem>WebDAV URL</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter remote URL..."
                                        disabled={connectionOptionsDisabled}
                                        onChange={event => this.handleUpdateForm("remoteURL", event)}
                                        value={this.state.remoteURL}
                                    />
                                </FormInputItem>
                            </FormRow>
                            <FormRow>
                                <FormLegendItem>WebDAV Username</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter WebDAV username..."
                                        disabled={connectionOptionsDisabled}
                                        onChange={event => this.handleUpdateForm("remoteUsername", event)}
                                        value={this.state.remoteUsername}
                                    />
                                </FormInputItem>
                            </FormRow>
                            <FormRow>
                                <FormLegendItem>WebDAV Password</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter WebDAV password..."
                                        type="password"
                                        disabled={connectionOptionsDisabled}
                                        onChange={event => this.handleUpdateForm("remotePassword", event)}
                                        value={this.state.remotePassword}
                                    />
                                </FormInputItem>
                            </FormRow>
                        </FormContainer>
                        <FormButtonContainer>
                            <ButtercupButton onClick={::this.handleConnectWebDAV} disabled={connectionOptionsDisabled}>
                                Connect
                            </ButtercupButton>
                        </FormButtonContainer>
                    </When>
                    <When condition={this.props.selectedArchiveType === "owncloud"}>
                        <FormContainer>
                            <FormRow>
                                <FormLegendItem>ownCloud URL</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter ownCloud URL..."
                                        disabled={connectionOptionsDisabled}
                                        onChange={event => this.handleUpdateForm("remoteURL", event)}
                                        value={this.state.remoteURL}
                                    />
                                </FormInputItem>
                            </FormRow>
                            <FormRow>
                                <FormLegendItem>ownCloud Username</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter ownCloud username..."
                                        disabled={connectionOptionsDisabled}
                                        onChange={event => this.handleUpdateForm("remoteUsername", event)}
                                        value={this.state.remoteUsername}
                                    />
                                </FormInputItem>
                            </FormRow>
                            <FormRow>
                                <FormLegendItem>ownCloud Password</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter ownCloud password..."
                                        type="password"
                                        disabled={connectionOptionsDisabled}
                                        onChange={event => this.handleUpdateForm("remotePassword", event)}
                                        value={this.state.remotePassword}
                                    />
                                </FormInputItem>
                            </FormRow>
                        </FormContainer>
                        <FormButtonContainer>
                            <ButtercupButton
                                onClick={::this.handleConnectOwnCloud}
                                disabled={connectionOptionsDisabled}
                            >
                                Connect
                            </ButtercupButton>
                        </FormButtonContainer>
                    </When>
                    <When condition={this.props.selectedArchiveType === "nextcloud"}>
                        <FormContainer>
                            <FormRow>
                                <FormLegendItem>Nextcloud URL</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter Nextcloud URL..."
                                        disabled={connectionOptionsDisabled}
                                        onChange={event => this.handleUpdateForm("remoteURL", event)}
                                        value={this.state.remoteURL}
                                    />
                                </FormInputItem>
                            </FormRow>
                            <FormRow>
                                <FormLegendItem>Nextcloud Username</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter Nextcloud username..."
                                        disabled={connectionOptionsDisabled}
                                        onChange={event => this.handleUpdateForm("remoteUsername", event)}
                                        value={this.state.remoteUsername}
                                    />
                                </FormInputItem>
                            </FormRow>
                            <FormRow>
                                <FormLegendItem>Nextcloud Password</FormLegendItem>
                                <FormInputItem>
                                    <ButtercupInput
                                        placeholder="Enter Nextcloud password..."
                                        type="password"
                                        disabled={connectionOptionsDisabled}
                                        onChange={event => this.handleUpdateForm("remotePassword", event)}
                                        value={this.state.remotePassword}
                                    />
                                </FormInputItem>
                            </FormRow>
                        </FormContainer>
                        <FormButtonContainer>
                            <ButtercupButton
                                onClick={::this.handleConnectNextcloud}
                                disabled={connectionOptionsDisabled}
                            >
                                Connect
                            </ButtercupButton>
                        </FormButtonContainer>
                    </When>
                    <When condition={this.props.selectedArchiveType === "dropbox"}>
                        <FormButtonContainer>
                            <ButtercupButton onClick={::this.handleDropboxAuth} disabled={isAuthenticatingDropbox}>
                                Authenticate with Dropbox
                            </ButtercupButton>
                        </FormButtonContainer>
                    </When>
                    <When condition={this.props.selectedArchiveType === "mybuttercup"}>
                        <FormButtonContainer>
                            <ButtercupButton
                                onClick={::this.handleMyButtercupAuth}
                                disabled={isAuthenticatingMyButtercup}
                            >
                                Authenticate with My Buttercup
                            </ButtercupButton>
                        </FormButtonContainer>
                    </When>
                    <Otherwise>
                        <i>Unsupported archive type.</i>
                    </Otherwise>
                </Choose>
            </SubSection>
        );
    }
}

export default AddArchivePage;
