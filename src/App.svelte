<script>
	// Empty script for now
</script>

<svelte:head>
	<title>NLB.DEV - Archive</title>
</svelte:head>

<main>
	<div class="content">
		<h1>Archive/</h1>
		<ul>
			<li>
				<a
					href="https://web.archive.org/web/20190531181500/https://www.nathanbennett.io/"
					target="archive"
				>
					nathanbennett.io
				</a>
			</li>
			<li>
				<a
					href="https://web.archive.org/web/20191025023446/http://reflextionsdev.com/"
					target="archive"
				>
					reflextionsdev.com
				</a>
			</li>
			<li>
				<a
					href="https://web.archive.org/web/20190531181440/https://www.nurobit.com/"
					target="archive"
				>
					nurobit.com
				</a>
			</li>
		</ul>
	</div>
</main>

<style>
	@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap");

	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
		background-image: url('/assets/backgrounds/nasa.jpg');
		background-size: cover;
		background-position: center;
		background-attachment: fixed;
		height: 100vh;
	}

	:global(body::before) {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.4);
		z-index: -1;
	}

	:global(*) {
		box-sizing: border-box;
	}

	main {
		font-family: "JetBrains Mono", monospace;
		color: #f0f0f0;
		padding: 3rem;
		margin: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.content {
		max-width: 400px;
	}

	.content h1 {
		font-size: 2rem;
		font-weight: 300;
		margin-bottom: 2rem;
		color: #64b5f6;
		letter-spacing: 2px;
		margin-left: -1rem;
	}

	.content ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.content li {
		margin-bottom: 0.5rem;
		position: relative;
		padding-left: 1.5rem;
		opacity: 0;
		transform: translateX(-20px);
		animation: slideIn 0.6s ease forwards;
	}

	.content li:nth-child(1) {
		animation-delay: 0.2s;
	}

	.content li:nth-child(2) {
		animation-delay: 0.4s;
	}

	.content li:nth-child(3) {
		animation-delay: 0.6s;
	}

	@keyframes slideIn {
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.content li::before {
		content: '-';
		position: absolute;
		left: 0;
		color: #f0f0f0;
	}

	.content a {
		color: #f0f0f0;
		text-decoration: none;
		font-size: 1rem;
		font-weight: 400;
		transition: opacity 0.2s ease;
	}

	.content a:hover {
		opacity: 0.7;
	}

	@media (max-width: 768px) {
		main {
			padding: 2rem;
		}

		.content h1 {
			font-size: 1.5rem;
		}
	}
</style>