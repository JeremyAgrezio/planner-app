<script>
	export const prerender = true;
</script>

<div class="app-container">
	<header style="height: 5vh;padding: 0.5em;">
		<h2 style="margin: 0;">Planner App</h2>
	</header>
	<slot></slot>
	<!-- <footer style="height: 5vh;"></footer> -->
</div>

<style>
	.app-container {
		font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}
</style>
