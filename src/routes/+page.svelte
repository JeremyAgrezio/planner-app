<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { flip } from 'svelte/animate';
	import { columns } from '$lib/stores';
	import type { Column, Card } from '$lib/localStore';
	import { dndzone } from 'svelte-dnd-action';

	let columnItems: Column[] = [];
	const flipDurationMs = 200;

	columns.subscribe((value) => {
		columnItems = value;
	});

	const showColumnActions = writable<number | null>(null);
	const showCardActions = writable<number | null>(null);

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
	});

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.actions')) {
			showColumnActions.set(null);
			showCardActions.set(null);
		}
	}

	function handleDndConsiderColumns(e: CustomEvent) {
		columns.set(e.detail.items);
	}

	function handleDndFinalizeColumns(e: CustomEvent) {
		columns.set(e.detail.items);
	}

	function handleDndConsiderCards(cid: number, e: CustomEvent) {
		const colIdx = columnItems.findIndex((c) => c.id === cid);
		columnItems[colIdx].items = e.detail.items;
		columns.set([...columnItems]);
	}

	function handleDndFinalizeCards(cid: number, e: CustomEvent) {
		const colIdx = columnItems.findIndex((c) => c.id === cid);
		columnItems[colIdx].items = e.detail.items;
		columns.set([...columnItems]);
	}

	function handleClick(e: MouseEvent) {
		alert('Les éléments déplaçables sont toujours cliquables :)');
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			handleClick(e as unknown as MouseEvent);
		}
	}

	// Ajouter une nouvelle colonne
	function addColumn(name: string) {
		columns.update((current) => [...current, { id: Date.now(), name, items: [] }]);
		newColumn.value = '';
	}

	// Ajouter une nouvelle carte à une colonne spécifique
	function addCard(columnId: number, name: string) {
		columns.update((current) => {
			return current.map((column) => {
				if (column.id === columnId) {
					return { ...column, items: [...column.items, { id: Date.now(), name }] };
				}
				return column;
			});
		});
	}

	// Supprimer une colonne
	function removeColumn(id: number) {
		columns.update((current) => current.filter((column) => column.id !== id));
		showColumnActions.set(null);
	}

	// Renommer une colonne
	function renameColumn(id: number, newName: string) {
		columns.update((current) => {
			return current.map((column) => {
				if (column.id === id) {
					return { ...column, name: newName };
				}
				return column;
			});
		});
		showColumnActions.set(null);
	}

	// Supprimer une carte d'une colonne spécifique
	function removeCard(columnId: number, cardId: number) {
		columns.update((current) => {
			return current.map((column) => {
				if (column.id === columnId) {
					return { ...column, items: column.items.filter((card) => card.id !== cardId) };
				}
				return column;
			});
		});
		showCardActions.set(null);
	}

	// Renommer une carte
	function renameCard(columnId: number, cardId: number, newName: string) {
		columns.update((current) => {
			return current.map((column) => {
				if (column.id === columnId) {
					return {
						...column,
						items: column.items.map((card) => {
							if (card.id === cardId) {
								return { ...card, name: newName };
							}
							return card;
						})
					};
				}
				return column;
			});
		});
		showCardActions.set(null);
	}

	let newColumn: HTMLInputElement;
	let newTask: { [key: number]: HTMLInputElement } = {};
</script>

<!-- Template HTML pour les colonnes et les cartes -->
<div class="board-container">
	<section
		class="board"
		use:dndzone={{ items: columnItems, flipDurationMs, type: 'columns' }}
		on:consider={handleDndConsiderColumns}
		on:finalize={handleDndFinalizeColumns}
	>
		{#each columnItems as column (column.id)}
			<div class="column" animate:flip={{ duration: flipDurationMs }}>
				<div class="column-title">
					<h4>{column.name}</h4>				
					<div class="actions">
						<button on:click={() => showColumnActions.set(column.id)}>...</button>
						<div class="actions-menu" class:show={column.id === $showColumnActions}>
							<button
								on:click={() =>
									renameColumn(
										column.id,
										prompt('Nouveau nom de la colonne:', column.name) || column.name
									)}>Renommer</button
							>
							<button on:click={() => removeColumn(column.id)}>Supprimer</button>
						</div>
					</div>
				</div>
				<div class="add-task">
					<input type="text" bind:this={newTask[column.id]} placeholder="Ajouter une tâche" />
					<button
						on:click={() => {
							addCard(column.id, newTask[column.id].value);
							newTask[column.id].value = '';
						}}>Ajouter</button
					>
				</div>
				<div
					class="column-content"
					use:dndzone={{ items: column.items, flipDurationMs }}
					on:consider={(e) => handleDndConsiderCards(column.id, e)}
					on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
				>
					{#each column.items as item (item.id)}
						<div class="card" animate:flip={{ duration: flipDurationMs }}>
							<span>{item.name}</span>
							<div class="actions">
								<button on:click={() => showCardActions.set(item.id)}>...</button>
								<div class="actions-menu" class:show={item.id === $showCardActions}>
									<button
										on:click={() =>
											renameCard(
												column.id,
												item.id,
												prompt('Nouveau nom de la tâche:', item.name) || item.name
											)}>Renommer</button
									>
									<button on:click={() => removeCard(column.id, item.id)}>Supprimer</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
		<div class="column">
			<div class="column-title add-column">
				<input type="text" bind:this={newColumn} placeholder="Ajouter une colonne" />
				<button on:click={() => addColumn(newColumn.value)}>Ajouter</button>
			</div>
		</div>
	</section>
</div>

<style>
	.board-container {
		width: 100%;
		overflow-x: auto;
	}

	.board {
		height: 83vh;
		display: flex;
		padding: 0.5em;
		margin-bottom: 1em;
	}

	.column {
		display: flex;
		flex-direction: column;
		flex: 0 0 auto;
		height: 100%;
		width: 17em;
		padding: 0.5em;
		margin-right: 2em;
		border: 1px solid #333333;
		overflow: hidden;
	}

	.column-content {
		flex: 1;
		overflow-y: auto;
		padding-right: 0.5em; /* Add space for the scrollbar */
		box-sizing: content-box; /* Ensures padding is not part of the width calculation */
	}

	.column-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5em 0;
		margin-bottom: 0.5em;
	}

	.column-title h4 {
		margin: 0;
	}

	.add-column,
	.add-task {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.add-column input,
	.add-task input {
		width: 100%;
		margin-right: 0.5em;
	}

	.card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5em;
		height: 15%;
		width: 100%;
		margin: 0.4em 0;
		background-color: #dddddd;
		border: 1px solid #333333;
		box-sizing: border-box; /* ensures padding and border are included in the width */
	}

	.actions {
		position: relative;
		display: inline-block;
	}

	.actions button {
		cursor: pointer;
	}

	.actions-menu {
		display: none;
		position: absolute;
		right: 0;
		background-color: white;
		border: 1px solid #ccc;
		z-index: 1;
	}

	.actions-menu.show {
		display: block;
	}

	.actions-menu button {
		display: block;
		width: 100%;
		padding: 0.5em;
		border: none;
		background: none;
		cursor: pointer;
	}

	.actions-menu button:hover {
		background-color: #f0f0f0;
	}
</style>
