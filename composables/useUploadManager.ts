import type {Picture} from "~/types/pictures";

export interface UploadPictureResponse {
    name: String,
    picture: Picture,
    thumbnail_error: ApiError | null,
}

export enum UploadPictureStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    DONE = 'done',
    ERROR = 'error',
    THUMBNAIL_WARNING = 'thumbnail_warning',
}

export interface UploadPicture {
    file: File;
    status: UploadPictureStatus;
    error?: ApiError;
}

export enum UploadBatchStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    UPLOADING_MINIMIZED = 'minimized',
    ERROR = 'error',
    DONE = 'done',
    CANCELLED = 'cancelled',
}

export interface UploadBatch {
    id: string;
    pictures: UploadPicture[];
    progress: number;
    status: UploadBatchStatus;
}


const batches = ref<UploadBatch[]>([]);
const nextId = ref(0);


export function useUploadManager() {

    const addUploadBatch = (files: File[]) => {
        console.log('Adding upload batch', files);
        batches.value.forEach(b => {
            if (b.status === UploadBatchStatus.UPLOADING) {
                b.status = UploadBatchStatus.UPLOADING_MINIMIZED;
            } else if (b.status !== UploadBatchStatus.UPLOADING_MINIMIZED) {
                removeUploadBatch(b.id);
            }
        });

        const newBatch: UploadBatch = {
            id: `upload-batch-${nextId.value++}`,
            pictures: files.map(file => ({file, status: UploadPictureStatus.PENDING})),
            progress: 0,
            status: UploadBatchStatus.PENDING,
        };
        batches.value.push(newBatch);
        console.log('New upload batches:', batches.value);
        batches.value = [...batches.value];
    };

    const minimizeBatch = (batchId: string) => {
        const initialValue: UploadBatch[] = [];
        batches.value = batches.value.reduce((acc, b) => {
            if (b.id === batchId) {
                if (b.status === UploadBatchStatus.UPLOADING) {
                    b.status = UploadBatchStatus.UPLOADING_MINIMIZED;
                }else {
                    // Minimizing a batch that is not uploading closes it
                    return acc;
                }
            }
            acc.push(b);
            return acc
        }, initialValue);
    };
    const maximizeBatch = (batchId: string) => {
        batches.value = batches.value.filter(b => {
            if (b.id === batchId) {
                if (b.status === UploadBatchStatus.UPLOADING_MINIMIZED) {
                    b.status = UploadBatchStatus.UPLOADING;
                }
                return true;
            }
            if (b.status === UploadBatchStatus.UPLOADING_MINIMIZED) {
                return true; // Keep minimized batches
            }
            if (b.status === UploadBatchStatus.UPLOADING) {
                b.status = UploadBatchStatus.UPLOADING_MINIMIZED;
                return true;
            }
            return false;
        });
    };

    const removeUploadBatch = (batchId: string) => {
        const batch = batches.value.find(b => b.id === batchId);
        if (!batch) return;
        if (batch.status === UploadBatchStatus.UPLOADING || batch.status === UploadBatchStatus.UPLOADING_MINIMIZED) {
            batch.status = UploadBatchStatus.CANCELLED;
        }
        batches.value = batches.value.filter(b => b.id !== batchId);
    };
    const cancelUpload = (batchId: string) => {
        const batch = batches.value.find(b => b.id === batchId);
        if (!batch) return;
        batch.status = UploadBatchStatus.CANCELLED;
    };
    const cancelFileUpload = (batchId: string, file: File) => {
        const batch = batches.value.find(b => b.id === batchId);
        if (batch) {
            batch.pictures = batch.pictures.filter(p => p.file !== file);
            if (batch.pictures.length === 0) {
                removeUploadBatch(batchId);
            }
        }
    };

    const startUpload = async (batchId: string) => {
        const batch = batches.value.find(b => b.id === batchId);
        if (!batch) return;
        if (batch.status !== UploadBatchStatus.PENDING && batch.status != UploadBatchStatus.ERROR && batch.status !== UploadBatchStatus.CANCELLED) return;

        batch.status = UploadBatchStatus.UPLOADING;
        let uploadedCount = 0;

        for (const picture of batch.pictures) {
            if (!(batch.status == UploadBatchStatus.UPLOADING || batch.status == UploadBatchStatus.UPLOADING_MINIMIZED)) { // Check for cancellation
                return;
            }

            if (picture.status === UploadPictureStatus.PENDING || picture.status === UploadPictureStatus.ERROR) {
                try {
                    picture.status = UploadPictureStatus.UPLOADING;
                    const formData = new FormData();
                    formData.append('file', picture.file);

                    const response = await postApi<FormData, UploadPictureResponse>('/picture', formData);
                    //await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate upload delay

                    // TODO: check for thumbnail error
                    picture.status = UploadPictureStatus.DONE;
                    uploadedCount++;
                    batch.progress = Math.round((uploadedCount / batch.pictures.length) * 100);
                    batches.value = [...batches.value]; // Trigger reactivity
                } catch (e) {
                    picture.status = UploadPictureStatus.ERROR;
                    picture.error = e as ApiError;
                    batch.status = UploadBatchStatus.ERROR; // Stop on first error
                    batches.value = [...batches.value]; // Trigger reactivity
                    return;
                }
            }
        }
        batch.status = UploadBatchStatus.DONE;
    };

    return {
        batches,
        addUploadBatch,
        minimizeBatch,
        maximizeBatch,
        removeUploadBatch,
        cancelUpload,
        cancelFileUpload,
        startUpload,
    };
}
