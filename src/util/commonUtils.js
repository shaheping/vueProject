export function computeEachSliceSize(total, sliceNum) {
    let eachSliceSize = Math.ceil(total / sliceNum);
    sliceNum = Math.ceil(total / eachSliceSize);
    return {eachSliceSize, sliceNum}
}