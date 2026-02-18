import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchClasses, fetchMetrics, fetchSubmissions } from '../api/teacherApi';
import {
  Box,
  Card,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import DataTable from './DataTable';
import KpiCard from './KpiCard';
import { Metrics, Class, Submission } from '../types';

const TeacherDashboard: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const { data: classesData, isLoading: isClassesLoading } = useQuery<Class[], Error>(
    ['classes'],
    fetchClasses
  );

  const { data: metricsData, isLoading: isMetricsLoading } = useQuery<Metrics, Error>(
    ['metrics', selectedClassId],
    () => (selectedClassId ? fetchMetrics(selectedClassId) : Promise.resolve(null)),
    {
      enabled: !!selectedClassId,
    }
  );

  const { data: submissionsData, isLoading: isSubmissionsLoading } = useQuery<
    Submission[],
    Error
  >(['submissions', selectedClassId], () => (selectedClassId ? fetchSubmissions(selectedClassId) : Promise.resolve(null)), {
    enabled: !!selectedClassId,
  });

  useEffect(() => {
    if (classesData && classesData.length > 0) {
      setSelectedClassId(classesData[0].id);
    }
  }, [classesData]);

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Teacher Dashboard
      </Typography>

      {isClassesLoading ? (
        <Typography>Loading classes...</Typography>
      ) : (
        <Card sx={{ mb: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classesData.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>{classItem.name}</TableCell>
                    <TableCell
                      onClick={() => handleClassSelect(classItem.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      Select
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {selectedClassId && (
        <>
          <Box display="flex" justifyContent="space-between">
            {metricsData && (
              <>
                <KpiCard
                  title="Completion Rate"
                  value={metricsData.completionRate}
                  unit="%"
                />
                <KpiCard
                  title="Average Time-on-Task"
                  value={metricsData.avgTimeOnTask}
                  unit="mins"
                />
              </>
            )}
          </Box>

          {isSubmissionsLoading ? (
            <Typography>Loading submissions...</Typography>
          ) : (
            <DataTable data={submissionsData || []} columns={['Student Name', 'Lesson', 'Score']} />
          )}
        </>
      )}
    </Box>
  );
};

export default TeacherDashboard;