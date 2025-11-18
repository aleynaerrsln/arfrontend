import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { deleteRestaurant } from '../../services/restaurantService';

function RestaurantList({ restaurants, onRestaurantDeleted }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Silme dialog'unu aç
  const handleDeleteClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setDeleteDialogOpen(true);
  };

  // Silme dialog'unu kapat
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRestaurant(null);
  };

  // Restoranı sil
  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await deleteRestaurant(selectedRestaurant._id);
      setDeleteDialogOpen(false);
      setSelectedRestaurant(null);
      onRestaurantDeleted();
    } catch (err) {
      alert('Restoran silinirken hata oluştu: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Boş liste kontrolü
  if (restaurants.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          Henüz restoran eklenmemiş
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Görünen İsim</strong></TableCell>
              <TableCell><strong>URL Adı</strong></TableCell>
              <TableCell><strong>Kullanıcı Adı</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Telefon</strong></TableCell>
              <TableCell><strong>Durum</strong></TableCell>
              <TableCell align="center"><strong>İşlemler</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {restaurants.map((restaurant) => (
              <TableRow key={restaurant._id} hover>
                <TableCell>{restaurant.displayName}</TableCell>
                <TableCell>
                  <Chip 
                    label={restaurant.name} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{restaurant.username}</TableCell>
                <TableCell>{restaurant.email || '-'}</TableCell>
                <TableCell>{restaurant.phone || '-'}</TableCell>
                <TableCell>
                  {restaurant.isActive ? (
                    <Chip label="Aktif" size="small" color="success" />
                  ) : (
                    <Chip label="Pasif" size="small" color="default" />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small" 
                    color="primary"
                    title="Düzenle"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteClick(restaurant)}
                    title="Sil"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Restoranı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedRestaurant?.displayName}</strong> restoranını silmek istediğinize emin misiniz?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Bu işlem geri alınamaz!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            İptal
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RestaurantList;
