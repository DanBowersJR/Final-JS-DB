// Log to confirm frontend.js is loaded
console.log("frontend.js is loaded");

// Establish a WebSocket connection to the server
const socket = new WebSocket('ws://localhost:3000/ws');

// Log when the WebSocket connection is established
socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
});

// Handle any WebSocket errors
socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
});

// Listen for messages from the server
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'new_poll') {
        onNewPollAdded(data.poll);
    } else if (data.type === 'vote_update') {
        onIncomingVote(data.poll);
    }
});

/**
 * Handles adding a new poll to the page when one is received from the server
 * 
 * @param {*} poll The data from the server (ideally containing the new poll's ID and its corresponding question)
 */
function onNewPollAdded(poll) {
    const pollContainer = document.getElementById('polls');
    const newPoll = document.createElement('li');
    newPoll.classList.add('poll-container');
    newPoll.innerHTML = `
        <h2>${poll.question}</h2>
        <ul class="poll-options">
            ${poll.options.map(option => `<li><strong>${option.answer}:</strong> ${option.votes} votes</li>`).join('')}
        </ul>
        <form class="poll-form">
            ${poll.options.map(option => `
                <button class="action-button vote-button" type="submit" value="${option.answer}" name="poll-option">
                    Vote for ${option.answer}
                </button>
            `).join('')}
            <input type="hidden" name="poll-id" value="${poll._id}">
        </form>
    `;
    pollContainer.appendChild(newPoll);

    // Add event listener to the new poll form
    newPoll.querySelector('.poll-form').addEventListener('submit', onVoteClicked);
}

/**
 * Handles updating the number of votes an option has when a new vote is received from the server
 * 
 * @param {*} poll The data from the server (probably containing which poll was updated and the new vote values for that poll)
 */
function onIncomingVote(poll) {
    const pollElement = document.getElementById(`poll_${poll._id}`);
    if (pollElement) {
        const options = pollElement.querySelectorAll('.poll-options li');
        poll.options.forEach((option, index) => {
            options[index].innerHTML = `<strong>${option.answer}:</strong> ${option.votes} votes`;
        });
    }
}

/**
 * Handles processing a user's vote when they click on an option to vote
 * 
 * @param {SubmitEvent} event The form event sent after the user clicks a poll option to "submit" the form
 */
function onVoteClicked(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const pollId = formData.get('poll-id');
    const selectedOption = event.submitter.value;

    // Send the vote to the server via WebSocket
    socket.send(JSON.stringify({
        type: 'vote',
        pollId: pollId,
        selectedOption: selectedOption
    }));
}

// Add a listener to each existing poll to handle votes (for polls already rendered)
document.querySelectorAll('.poll-form').forEach((pollForm) => {
    pollForm.addEventListener('submit', onVoteClicked);
});
