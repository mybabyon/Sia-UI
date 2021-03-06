import React from 'react'
import proxyquire from 'proxyquire'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import sinon from 'sinon'

import UploadButton from '../../plugins/Files/js/components/uploadbutton.js'
import FileBrowser from '../../plugins/Files/js/components/filebrowser.js'

const testButton = (files, isDir) => {
	const uploadSpy = sinon.spy()
	const testActions = {
		showUploadDialog: uploadSpy,
	}
	const openFileSpy = sinon.spy( () => files )
	global.SiaAPI = { openFile: openFileSpy }
	const uploadButton = shallow(<UploadButton actions={testActions} />)
	if (isDir) {
		uploadButton.find('.upload-button').at(1).simulate('click')
	} else {
		uploadButton.find('.upload-button').first().simulate('click')
	}
	return {uploadSpy, openFileSpy}
}

const testDrag = (files) => {
	const uploadSpy = sinon.spy()
	const notDraggingSpy = sinon.spy()
	const testActions = {
		showUploadDialog: uploadSpy,
		setNotDragging: notDraggingSpy,
	}
	const fileBrowser = shallow(<FileBrowser dragging={false} showUploadDialog={false} showDeleteDialog={false} showFileTransfers={false} actions={testActions} />)
	fileBrowser.find('.file-browser').first().simulate('drop', {
		dataTransfer: {
			files: files.map((file) => ({ path: file }))
		},
		preventDefault: () => undefined,
	})
	return {uploadSpy, notDraggingSpy}
}

const testDialog = (files, isDir) => {
	const uploadFolderSpy = sinon.spy()
	const uploadFileSpy = sinon.spy()
	const hideUploadDialogSpy = sinon.spy()
	const testActions = {
		uploadFolder: uploadFolderSpy,
		uploadFile: uploadFileSpy,
		hideUploadDialog: hideUploadDialogSpy,
	}
	const UploadDialog = proxyquire('../../plugins/Files/js/components/uploaddialog.js', {
		fs: { statSync: () => ({ isDirectory: () => isDir }), '@noCallThru': true },
	}).default
	const uploadDialog = shallow(<UploadDialog actions={testActions} source={files} path="" />)
	uploadDialog.find('.upload-dialog-buttons').children().first().simulate('click')
	return {uploadFolderSpy, uploadFileSpy, uploadDialog}
}

const siaOpenFilesArg = {
	title: 'Choose a file to upload',
	properties: ['openFile', 'multiSelections'],
}

const siaOpenFoldersArg = {
	title: 'Choose a file to upload',
	properties: ['openDirectory'],
}

describe('files upload button component', () => {
	it('dispatches proper action for a single file upload', () => {
		const testFiles = ['filename.png']
		const spies = testButton(testFiles)
		expect(spies.uploadSpy.alwaysCalledWithExactly(testFiles)).to.be.true
		expect(spies.uploadSpy.calledOnce).to.be.true
		expect(spies.openFileSpy.alwaysCalledWithExactly(siaOpenFilesArg)).to.be.true
		expect(spies.openFileSpy.calledOnce).to.be.true
	})

	it('dispatches proper action for a multiple file upload', () => {
		const testFiles = ['filename.png', 'file2.jpg', 'files3.pdf', 'cat.gifs']
		const spies = testButton(testFiles)
		expect(spies.uploadSpy.alwaysCalledWithExactly(testFiles)).to.be.true
		expect(spies.uploadSpy.calledOnce).to.be.true
		expect(spies.openFileSpy.alwaysCalledWithExactly(siaOpenFilesArg)).to.be.true
		expect(spies.openFileSpy.calledOnce).to.be.true
	})

	it('dispatches proper action for a single folder upload', () => {
		const testFolders = ['I am a folder.']
		const spies = testButton(testFolders, true)
		expect(spies.uploadSpy.alwaysCalledWithExactly(testFolders)).to.be.true
		expect(spies.uploadSpy.calledOnce).to.be.true
		expect(spies.openFileSpy.alwaysCalledWithExactly(siaOpenFoldersArg)).to.be.true
		expect(spies.openFileSpy.calledOnce).to.be.true
	})

	it('dispatches proper action for a multiple folder upload', () => {
		const testFolders = ['Folders ', '987238479Holder', 'Yeah I\'m a folder.', 'Me too!']
		const spies = testButton(testFolders, true)
		expect(spies.uploadSpy.alwaysCalledWithExactly(testFolders)).to.be.true
		expect(spies.uploadSpy.calledOnce).to.be.true
		expect(spies.openFileSpy.alwaysCalledWithExactly(siaOpenFoldersArg)).to.be.true
		expect(spies.openFileSpy.calledOnce).to.be.true
	})
})

describe('files drag upload', () => {
	it('dispatches proper action for a single file drag upload', () => {
		const testFiles = ['filename.png']
		const spies = testDrag(testFiles)
		expect(spies.uploadSpy.alwaysCalledWithExactly(testFiles)).to.be.true
		expect(spies.uploadSpy.calledOnce).to.be.true
		expect(spies.notDraggingSpy.calledOnce).to.be.true
	})

	it('dispatches proper action for a multiple file drag upload', () => {
		const testFiles = ['filename.png', 'another file name.har', 'yesStillAnotherName.wohoo']
		const spies = testDrag(testFiles)
		expect(spies.uploadSpy.alwaysCalledWithExactly(testFiles)).to.be.true
		expect(spies.uploadSpy.calledOnce).to.be.true
		expect(spies.notDraggingSpy.calledOnce).to.be.true
	})

	it('dispatches proper action for a single folder drag upload', () => {
		const testFiles = ['Awesome Folder']
		const spies = testDrag(testFiles)
		expect(spies.uploadSpy.alwaysCalledWithExactly(testFiles)).to.be.true
		expect(spies.uploadSpy.calledOnce).to.be.true
		expect(spies.notDraggingSpy.calledOnce).to.be.true
	})

	it('dispatches proper action for a multiple folder drag upload', () => {
		const testFiles = ['An amazing Folder', 'Another Amazing Folder', 'Still Another More Amazing Folder']
		const spies = testDrag(testFiles)
		expect(spies.uploadSpy.alwaysCalledWithExactly(testFiles)).to.be.true
		expect(spies.uploadSpy.calledOnce).to.be.true
		expect(spies.notDraggingSpy.calledOnce).to.be.true
	})
})

describe('files upload dialog component', () => {
	it('correctly displays dialog for single file', () => {
		const testFiles = ['filename.png']
		const testResults = testDialog(testFiles)
		expect(testResults.uploadDialog.find('.upload-dialog').children('div').first().text()).to.equal(`Would you like to upload ${testFiles.length} ${testFiles.length === 1 ? 'item' : 'items'}?`)
		expect(testResults.uploadFolderSpy.callCount).to.equal(0)
		expect(testResults.uploadFileSpy.callCount).to.equal(testFiles.length)
		testFiles.forEach( (file) => {
			expect(testResults.uploadFileSpy.calledWith('', file)).to.be.true
		})
	})

	it('correctly displays dialog for multiple files', () => {
		const testFiles = ['filename.png', 'tomuch.meme', 'sia.sia.sia.sia.sia', '.sia.test']
		const testResults = testDialog(testFiles)
		expect(testResults.uploadDialog.find('.upload-dialog').children('div').first().text()).to.equal(`Would you like to upload ${testFiles.length} ${testFiles.length === 1 ? 'item' : 'items'}?`)
		expect(testResults.uploadFolderSpy.callCount).to.equal(0)
		expect(testResults.uploadFileSpy.callCount).to.equal(testFiles.length)
		testFiles.forEach( (file) => {
			expect(testResults.uploadFileSpy.calledWith('', file)).to.be.true
		})
	})

	it('correctly displays dialog for single folder', () => {
		const testFiles = ['folder']
		const testResults = testDialog(testFiles, true)
		expect(testResults.uploadDialog.find('.upload-dialog').children('div').first().text()).to.equal(`Would you like to upload ${testFiles.length} ${testFiles.length === 1 ? 'item' : 'items'}?`)
		expect(testResults.uploadFileSpy.callCount).to.equal(0)
		expect(testResults.uploadFolderSpy.callCount).to.equal(testFiles.length)
		testFiles.forEach( (file) => {
			expect(testResults.uploadFolderSpy.calledWith('', file)).to.be.true
		})
	})

	it('correctly displays dialog for multiple folders', () => {
		const testFiles = ['foldername', 'An amazing name', 'SIASIASIASIASIASIA', 'FTW']
		const testResults = testDialog(testFiles, true)
		expect(testResults.uploadDialog.find('.upload-dialog').children('div').first().text()).to.equal(`Would you like to upload ${testFiles.length} ${testFiles.length === 1 ? 'item' : 'items'}?`)
		expect(testResults.uploadFileSpy.callCount).to.equal(0)
		expect(testResults.uploadFolderSpy.callCount).to.equal(testFiles.length)
		testFiles.forEach( (file) => {
			expect(testResults.uploadFolderSpy.calledWith('', file)).to.be.true
		})
	})
})
