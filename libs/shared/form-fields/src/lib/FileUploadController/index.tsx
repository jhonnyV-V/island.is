import React, { FC, useState, useReducer, useEffect } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { useMutation } from '@apollo/client'

import {
  getValueViaPath,
  Application,
  coreErrorMessages,
} from '@island.is/application/core'
import {
  InputFileUpload,
  UploadFile,
  fileToObject,
} from '@island.is/island-ui/core'
import { useLocale } from '@island.is/localization'
import {
  CREATE_UPLOAD_URL,
  ADD_ATTACHMENT,
  DELETE_ATTACHMENT,
} from '@island.is/application/graphql'
import { InputImageUpload } from '@island.is/application/ui-components'

import { uploadFileToS3 } from './utils'
import { Action, ActionTypes } from './types'
import { FileRejection } from 'react-dropzone'

type UploadFileAnswer = {
  name: string
  key?: string
}

// Transform an uploaded file to an form answer.
const transformToAnswer = ({ name, key }: UploadFile): UploadFileAnswer => {
  return { name, key }
}

// Transform an form answer to an uploaded file object to display.
const answerToUploadFile = ({ name, key }: UploadFile): UploadFile => {
  return { name, key, status: 'done' }
}

function reducer(state: UploadFile[], action: Action) {
  switch (action.type) {
    case ActionTypes.ADD:
      return state.concat(action.payload.newFiles)

    case ActionTypes.REMOVE:
      return state.filter(
        (file) => file.name !== action.payload.fileToRemove.name,
      )

    case ActionTypes.UPDATE:
      return state.map((file: UploadFile) => {
        if (file.name === action.payload.file.name) {
          file.status = action.payload.status
          file.percent = action.payload.percent
          file.key = action.payload.key
        }
        return file
      })

    default:
      return state
  }
}

interface FileUploadControllerProps {
  readonly id: string
  error?: string
  application: Application
  readonly header?: string
  readonly description?: string
  readonly buttonLabel?: string
  readonly multiple?: boolean
  readonly accept?: string
  readonly maxSize?: number
  readonly forImageUpload?: boolean
}

export const FileUploadController: FC<FileUploadControllerProps> = ({
  id,
  error,
  application,
  header,
  description,
  buttonLabel,
  multiple,
  accept,
  maxSize,
  forImageUpload,
}) => {
  const { formatMessage } = useLocale()
  const { clearErrors, setValue } = useFormContext()
  const [uploadError, setUploadError] = useState<string | undefined>(error)
  const val = getValueViaPath(application.answers, id, []) as UploadFile[]
  const [createUploadUrl] = useMutation(CREATE_UPLOAD_URL)
  const [addAttachment] = useMutation(ADD_ATTACHMENT)
  const [deleteAttachment] = useMutation(DELETE_ATTACHMENT)
  const initialUploadFiles: UploadFile[] =
    (val && val.map((f) => answerToUploadFile(f))) || []
  const [state, dispatch] = useReducer(reducer, initialUploadFiles)

  useEffect(() => {
    const onlyUploadedFiles = state.filter(
      (f: UploadFile) => f.key && f.status === 'done',
    )

    const uploadAnswer: UploadFileAnswer[] = onlyUploadedFiles.map(
      transformToAnswer,
    )

    setValue(id, uploadAnswer)
  }, [state, id, setValue])

  const uploadFileFlow = async (file: UploadFile) => {
    try {
      // 1. Get the upload URL
      const { data } = await createUploadUrl({
        variables: {
          filename: file.name,
        },
      })

      // 2. Upload the file to S3
      const {
        createUploadUrl: { url, fields },
      } = data

      const response = await uploadFileToS3(file, dispatch, url, fields)

      // 3. Add Attachment Data
      await addAttachment({
        variables: {
          input: {
            id: application.id,
            key: fields.key,
            url: `${response.url}/${fields.key}`,
          },
        },
      })

      // Done!
      return Promise.resolve({ key: fields.key })
    } catch (e) {
      console.error(`Error with FileUploadController ${e}`)
      setUploadError(formatMessage(coreErrorMessages.fileUpload))
      return Promise.reject()
    }
  }

  const onFileUploadError = async (failedFiles: FileRejection[]) => {
    failedFiles.forEach((file: FileRejection) => {
      if (maxSize && file.file.size > maxSize) {
        return setUploadError(
          'The file is larger than the allowed file size of ' +
            maxSize / 1000000 +
            'MB',
        )
      } else setUploadError(formatMessage(coreErrorMessages.fileUpload))
    })
  }

  const onFileChange = async (newFiles: File[]) => {
    const addedUniqueFiles = newFiles.filter((newFile: File) => {
      let isUnique = true
      state.forEach((uploadedFile: UploadFile) => {
        if (uploadedFile.name === newFile.name) isUnique = false
      })
      return isUnique
    })

    if (addedUniqueFiles.length === 0) return

    clearErrors(id)
    setUploadError(undefined)

    const newUploadFiles = addedUniqueFiles.map((f) =>
      fileToObject(f, 'uploading'),
    )

    // Add the files to the list so that the control presents them
    // with a spinner.
    dispatch({
      type: ActionTypes.ADD,
      payload: {
        newFiles: newUploadFiles,
      },
    })

    // Upload each file.
    newUploadFiles.forEach(async (f: UploadFile) => {
      try {
        const res = await uploadFileFlow(f)

        dispatch({
          type: ActionTypes.UPDATE,
          payload: {
            file: f,
            status: 'done',
            percent: 100,
            key: res.key,
          },
        })
      } catch {
        setUploadError(formatMessage(coreErrorMessages.fileUpload))
      }
    })
  }

  const onRemoveFile = async (fileToRemove: UploadFile) => {
    // If it's previously been uploaded, remove it from the application attachment.
    if (fileToRemove.key) {
      try {
        await deleteAttachment({
          variables: {
            input: {
              id: application.id,
              key: fileToRemove.key,
            },
          },
        })
      } catch {
        setUploadError(formatMessage(coreErrorMessages.fileRemove))
        return
      }
    }

    // We remove it from the list if: the delete attachment above succeeded,
    // or if the user clicked x for a file that failed to upload and is in
    // an error state.
    dispatch({
      type: ActionTypes.REMOVE,
      payload: {
        fileToRemove,
      },
    })

    setUploadError(undefined)
  }

  const FileUploadComponent = forImageUpload
    ? InputImageUpload
    : InputFileUpload

  return (
    <Controller
      name={id}
      defaultValue={initialUploadFiles}
      render={() => (
        <FileUploadComponent
          applicationId={application.id}
          fileList={state}
          header={header}
          description={description}
          buttonLabel={buttonLabel}
          onChange={onFileChange}
          onUploadError={onFileUploadError}
          onRemove={onRemoveFile}
          errorMessage={uploadError || error}
          multiple={multiple}
          accept={accept}
          maxSize={maxSize}
        />
      )}
    />
  )
}

export default FileUploadController
