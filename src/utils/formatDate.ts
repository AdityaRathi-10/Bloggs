export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

export const formatDate2 = (date: number) => {
    const timeAgo = Math.floor((Date.now() - date) / 1000)
    if (timeAgo < 60) return `${timeAgo} second${timeAgo === 1 ? '' : 's'} ago`
    if (timeAgo < 3600) return `${Math.floor(timeAgo / 60)} minute${Math.floor(timeAgo / 60) === 1 ? '' : 's'} ago`
    if (timeAgo < 86400) return `${Math.floor(timeAgo / 3600)} hour${Math.floor(timeAgo / 3600) === 1 ? '' : 's'} ago`
    if (timeAgo < 604800) return `${Math.floor(timeAgo / 86400)} day${Math.floor(timeAgo / 86400) === 1 ? '' : 's'} ago`
    if (timeAgo < 2592000) return `${Math.floor(timeAgo / 604800)} week${Math.floor(timeAgo / 604800) === 1 ? '' : 's'} ago`
    if (timeAgo < 31104000) return `${Math.floor(timeAgo / 2592000)} month${Math.floor(timeAgo / 2592000) === 1 ? '' : 's'} ago`
    return `${Math.floor(timeAgo / 31104000)} year${Math.floor(timeAgo / 31104000) === 1 ? '' : 's'} ago`
};