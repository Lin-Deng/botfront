import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';

import {
    Dropdown, Button, Message, Icon, Header,
} from 'semantic-ui-react';

import { Projects } from '../../../api/project/project.collection';


import { getNluModelLanguages } from '../../../api/nlu_model/nlu_model.utils';

import ImportDropField from './importProjectDropfield';

const ImportProject = ({
    projectLanguages,
    setLoading,
}) => {
    const importTypeOptions = [
        {
            key: 'botfront',
            text: ' Import Botfront project',
            value: 'botfront',
            successText: 'Your current project has been overwritten.',
            successHeader: 'Botfront import successful!',
        },
        // {
        //     key: 'rasa',
        //     text: 'Import Rasa/Rasa X project',
        //     value: 'rasa',
        // },
    ];

    const [importType, setImportType] = useState('');
    const [importLanguage, setImportLanguage] = useState('');
    const [botfrontFileSuccess, setBotfrontFileSuccess] = useState(false);
    const [backupDownloaded, setbackupDownloaded] = useState(false);
    const [importSuccessful, setImportSuccessful] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState({});


    const getLanguageOptions = () => (
        projectLanguages.map(({ value, text }) => ({
            key: value,
            text,
            value,
        }))
    );

    const validateImportType = () => {
        if (!importTypeOptions.some(({ value }) => value === importType)) {
            return false;
        }
        return true;
    };

    const validateImportLanguage = () => {
        if (
            importType === 'rasa'
            && !getLanguageOptions().some(({ value }) => value === importLanguage)) {
            return false;
        }
        return true;
    };

    const validateFiles = () => {
        if (importType === 'botfront' && botfrontFileSuccess) {
            return true;
        }
        return false;
    };

    const importProject = () => {
        setLoading(true);
        console.log('importing...');
        console.log(uploadedFiles);
        setLoading(false);
        setImportSuccessful(true);
    };

    const fileAdded = (file) => {
        console.log('new file added');
        setUploadedFiles({ ...uploadedFiles, ...file });
        setBotfrontFileSuccess(true);
    };

    const verifyBotfrontFile = (file) => {
        console.log(file);
        return true;
    };

    const backupProject = () => {
        setbackupDownloaded(true);
    };

    const importButtonText = () => {
        if (importType === 'botfront') {
            return 'Import Botfront project';
        }
        return 'Import project';
    };

    const backupMessage = (backupDownloaded
        ? (
            <>
                <Message
                    positive
                    icon='check circle'
                    header='Backup successfully downloaded!'
                    content='You may now import your Botfront project.'
                />
            </>
        )
        : (
            <>
                <Message
                    warning
                    icon='exclamation circle'
                    header='Your project will be overwritten.'
                    content='Please use the button below to download a backup before proceeding.'
                />
                <Button onClick={backupProject} className='export-option'>
                    <Icon name='download' />
                    Backup current project
                </Button>
                <br />
            </>
        )
    );
    if (importSuccessful) {
        return (
            <Message
                positive
                className='import-successful'
                icon='check circle'
                header={importTypeOptions.find(options => options.value === importType).successHeader}
                content={importTypeOptions.find(options => options.value === importType).successText}
            />
        );
    }

    return (
            <>
                <Dropdown
                    key='format'
                    className='export-option'
                    options={importTypeOptions.map(({ value, key, text }) => ({ value, key, text }))}
                    placeholder='Select a format'
                    selection
                    onChange={(x, { value }) => { setImportType(value); }}
                />
                <br />
                {importType === 'rasa' && (
                    <>
                        <Dropdown
                            key='language'
                            className='export-option'
                            options={getLanguageOptions()}
                            placeholder='select a language'
                            selection
                            onChange={(x, { value }) => { setImportLanguage(value); }}
                        />
                        <br />
                    </>
                )}
                {(importType === 'botfront' && validateImportType()) && (
                    <ImportDropField
                        onChange={fileAdded}
                        text='Drop your Botfront project in JSON format here. Data should not be larger than 30 Mb.'
                        manipulateData={JSON.parse}
                        verifyData={verifyBotfrontFile}
                        success={botfrontFileSuccess}
                        fileTag='botfront'
                        successMessage='Your Botfront project file is ready.'
                    />
                )}
                {importType === 'botfront' && botfrontFileSuccess && (
                    <>
                        {backupMessage}
                    </>
                )}
                {validateImportType() && (
                    <Button onClick={importProject} disabled={!backupDownloaded} className='export-option'>
                        <Icon name='upload' />
                        {importButtonText()}
                    </Button>
                )}
            </>
    );
};

ImportProject.propTypes = {
    projectId: PropTypes.string.isRequired,
    projectLanguages: PropTypes.array,
    setLoading: PropTypes.func.isRequired,
};

ImportProject.defaultProps = {
    projectLanguages: [],
};

const ImportProjectContainer = withTracker(({ projectId }) => {
    const project = Projects.findOne({ _id: projectId });
    const projectLanguages = getNluModelLanguages(project.nlu_models, true);
    return {
        projectLanguages,
    };
})(ImportProject);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(ImportProjectContainer);
