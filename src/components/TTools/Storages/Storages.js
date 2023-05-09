import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import React, { useEffect, useState } from 'react';

import CustomTable from '../../_common/CustomTable';

let storages = require('./storages.json');

const Storages = props => {
	const [showStorage, setShowStorage] = useState();
	const [modal, setModal] = useState(false);
	const [storageData, setStorageData] = useState(null);

	const toggle = () => setModal(!modal);

	const formatter = (storage, key) => {
		return (
			<tr key={key}>
				<td>{storage.name}</td>
				<td>{storage.totalAmount}</td>
				<td>{storage.totalWeight.toFixed(2)}</td>
				<td>{storage.size - storage.totalWeight}</td>
				<td>{storage.size.toFixed(2)}</td>
				<td>{((storage.totalWeight / storage.size) * 100).toFixed(2)}%</td>

				<td>
					<Button
						color="info"
						onClick={() => {
							setShowStorage(storage);
							toggle();
						}}>
						View Items
					</Button>
				</td>
				<td>
					{
						<a
							className="btn btn-info"
							href={`/home/ttools/storage/map/?storage=${storage.id}`}
							target="_blank"
							rel="noopener noreferrer">
							Go
						</a>
					}
				</td>
			</tr>
		);
	};

	function modalFormatter(item) {
		return (
			<tr key={item.name}>
				<td dangerouslySetInnerHTML={{ __html: resolveItemName(item) }} />
				<td>{item.amount}</td>
				<td>{item.weight * item.amount}</td>
				<td>
					{(((item.weight * item.amount) / showStorage.size) * 100).toFixed(2)}%
				</td>
			</tr>
		);
	}

	function StorageName(storage) {
		if (storage.startsWith('faq_')) {
			return storage.replace('faq_', 'Facton ');
		}

		return storages[storage].name;
	}

	function StorageSize(storage) {
		if (storage.name.startsWith('faq_')) {
			return 500000;
		}

		if (storage.name.startsWith('biz_train')) {
			return 16000 + Math.floor((16000 * storage.lvl) / 9 / 10) * 10;
		}

		if (storage.name.startsWith('biz_')) {
			return storages[storage.name].size * storage.lvl;
		}

		return storages[storage.name].size;
	}

	function resolveItemName(item) {
		if (item.dName) return item.dName;
		if (item.name.startsWith('vehicle_shipment'))
			return item.name.split('|')[2];
		if (item.name.startsWith('rts_card')) return item.name.split('|')[2];
		if (item.name.startsWith('gut_knife')) return item.name.split('|')[0];

		return item.name;
	}

	useEffect(() => {
		if (!props.data) return;

		const storages = [];

		// eslint-disable-next-line
		for (const storage of props.data) {
			storages.push({
				id: storage.name,
				name: StorageName(storage.name),
				inventory: storage.inventory,
				totalAmount: storage.inventory.reduce((a, b) => a + b.amount, 0),
				totalWeight: storage.inventory.reduce(
					(a, b) => a + b.weight * b.amount,
					0
				),
				size: StorageSize(storage),
			});
		}

		if (props.premium || props.postop) {
			storages.forEach(storage => {
				const extra = storage.size * 0.15;
				if (props.premium) storage.size += extra;
				if (props.postop) storage.size += extra;
			});
		}

		if (props.strength) {
			const strengthLvl = props.strength > 30 ? 30 : props.strength;

			//Find inventory
			const inventory = storages.find(storage => storage.name === 'Inventory');

			inventory.size = inventory.size + 10 * strengthLvl;
		}

		props.data.storages = storages;

		setStorageData(props.data);
		setShowStorage(props.data.storages[0]);
	}, [props.data]);

	return (
		<>
			{storageData ? (
				<div>
					<Modal isOpen={modal} toggle={toggle} size="lg" fade>
						<ModalHeader toggle={toggle}>
							{showStorage.name + ' (Items)'}
						</ModalHeader>
						<ModalBody>
							<CustomTable
								headers={modalHeaders}
								data={showStorage.inventory}
								keyField="item"
								pagination={true}
								format={modalFormatter}
								config={{ id: 'storage-items' }}
							/>
						</ModalBody>
						<ModalFooter>
							<Button color="primary" onClick={toggle}>
								Done
							</Button>
						</ModalFooter>
					</Modal>

					<h2>Storages</h2>

					<CustomTable
						config={config}
						headers={headers}
						data={storageData.storages}
						format={formatter}
					/>
				</div>
			) : (
				<div>
					<h2>No items found</h2>
				</div>
			)}
		</>
	);
};

export default Storages;

const config = {
	id: 'storages-storage',
};

const headers = [
	'Storage name',
	'Storage Quantity',
	'Storage Used (in kg)',
	'Capacity Unused (in kg)',
	'Storage Capacity (in kg)',
	'Storage Usage',
	'Inventory',
	'Location',
];

const modalHeaders = ['Item', 'Amount', 'Weight (kg)', 'Percentage'];
