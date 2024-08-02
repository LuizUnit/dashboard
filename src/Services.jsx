export const lastCardObserver = new IntersectionObserver(entries => {
    const lastCard = entries[0]
    if (!lastCard.isIntersecting) return
    loadContent(lastCard.target.id)
    lastCardObserver.unobserve(lastCard.target)
}, {})

export const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        entry.target.classList.toggle("show", entry.isIntersecting);
    });
});
